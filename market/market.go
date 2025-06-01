package market

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"net/http"

	"database/sql"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"

	"blockchain-dev1/blockchain"
	"blockchain-dev1/transaction"
	"blockchain-dev1/types"
	"blockchain-dev1/utils"
	"blockchain-dev1/wallets"
)

type MarketItem struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Owner    string  `json:"owner"`
	IsListed bool    `json:"is_listed"`
}

var Market []MarketItem

const marketDBFile = "markets.db"

func openMarketDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", marketDBFile)
	if err != nil {
		return nil, err
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS market_items (
		id TEXT PRIMARY KEY,
		name TEXT,
		price REAL,
		owner TEXT,
		is_listed INTEGER
	)`)
	if err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func SaveMarket(market []MarketItem) error {
	db, err := openMarketDB()
	if err != nil {
		return err
	}
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	_, err = tx.Exec("DELETE FROM market_items")
	if err != nil {
		tx.Rollback()
		return err
	}
	stmt, err := tx.Prepare("INSERT INTO market_items(id, name, price, owner, is_listed) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()
	for _, item := range market {
		_, err := stmt.Exec(item.ID, item.Name, item.Price, item.Owner, boolToInt(item.IsListed))
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	return tx.Commit()
}

func LoadMarket() ([]MarketItem, error) {
	db, err := openMarketDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()

	rows, err := db.Query("SELECT id, name, price, owner, is_listed FROM market_items")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var market []MarketItem
	for rows.Next() {
		var item MarketItem
		var isListedInt int
		if err := rows.Scan(&item.ID, &item.Name, &item.Price, &item.Owner, &isListedInt); err != nil {
			return nil, err
		}
		item.IsListed = isListedInt != 0
		market = append(market, item)
	}
	return market, nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func CreateMarketItem(name string, price float64, owner string) MarketItem {
	item := MarketItem{
		ID:       uuid.New().String(),
		Name:     name,
		Price:    price,
		Owner:    owner,
		IsListed: true,
	}
	Market = append(Market, item)
	SaveMarket(Market)
	return item
}

type SellRequest struct {
	WalletFile string  `json:"wallet_file"`
	ItemName   string  `json:"item_name"`
	Price      float64 `json:"price"`
}

func MarketHandler(mux *http.ServeMux) {

	db, err := openMarketDB()
	if err != nil {
		panic(err)
	}
	defer db.Close()

	mux.HandleFunc("/market/sell", SellHandler)
	mux.HandleFunc("/market/buy", BuyHandler(db))
	mux.HandleFunc("/market/list", ListHandler)
	// mux.HandleFunc("/market/items", itemsHandler)
	// mux.HandleFunc("/market/load", loadMarketHandler)
	// mux.HandleFunc("/market/save", saveMarketHandler)
}

func SellHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		WalletAddress string  `json:"wallet_address"`
		Mnemonic      string  `json:"mnemonic"`
		Amount        float64 `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	db, err := openMarketDB()
	if err != nil {
		http.Error(w, "Failed to open DB", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	wallet, err := wallets.GetWalletByAddress(db, req.WalletAddress)
	if err != nil {
		http.Error(w, "Wallet not found", http.StatusNotFound)
		return
	}

	aesKey := utils.HashMnemonic(req.Mnemonic)

	privKeyBytes, err := wallets.DecryptPrivateKey(wallet.PrivateKey, aesKey)
	if err != nil {
		http.Error(w, "Failed to decrypt private key, check mnemonic", http.StatusUnauthorized)
		return
	}

	privKey, err := LoadECDSAPrivateKeyFromString(string(privKeyBytes))
	if err != nil {
		http.Error(w, "Failed to load private key", http.StatusInternalServerError)
		return
	}

	pubKeyBytes, _ := x509.MarshalPKIXPublicKey(&privKey.PublicKey)
	address := utils.GetAddress(pubKeyBytes)

	// No item name, just sell amount as a market item
	item := CreateMarketItem("", req.Amount, address)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

type BuyRequest struct {
	From   string  `json:"from"`
	To     string  `json:"to"`
	Amount float64 `json:"amount"`
}

func BuyHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			BuyerAddress string `json:"buyer_address"`
			ItemID       string `json:"item_id"`
			Mnemonic     string `json:"mnemonic"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON body", http.StatusBadRequest)
			return
		}

		// Cari item di market berdasarkan ID
		var item *MarketItem
		for i := range Market {
			if Market[i].ID == req.ItemID && Market[i].IsListed {
				item = &Market[i]
				break
			}
		}
		if item == nil {
			http.Error(w, "Item not found or not listed", http.StatusNotFound)
			return
		}
		if item.Owner == req.BuyerAddress {
			http.Error(w, "Cannot buy your own item", http.StatusBadRequest)
			return
		}

		// Load wallet pembeli dari DB
		wallet, err := wallets.GetWalletByAddress(db, req.BuyerAddress)
		if err != nil {
			http.Error(w, "Buyer wallet not found", http.StatusNotFound)
			return
		}

		// Generate key AES dari mnemonic pembeli
		aesKey := utils.HashMnemonic(req.Mnemonic)

		// Decrypt private key pembeli
		privKeyBytes, err := wallets.DecryptPrivateKey(wallet.PrivateKey, aesKey)
		if err != nil {
			http.Error(w, "Failed to decrypt private key, check mnemonic", http.StatusUnauthorized)
			return
		}

		// Load ECDSA private key pembeli
		privKey, err := LoadECDSAPrivateKeyFromString(string(privKeyBytes))
		if err != nil {
			http.Error(w, "Failed to load private key", http.StatusInternalServerError)
			return
		}

		// Buat transaksi dari pembeli ke penjual
		tx := types.Transaction{
			Sender:    req.BuyerAddress,
			Recipient: item.Owner,
			Amount:    item.Price,
		}

		// Sign transaksi
		if err := transaction.SignTransaction(privKey, &tx); err != nil {
			http.Error(w, "Failed to sign transaction", http.StatusInternalServerError)
			return
		}

		// Masukkan transaksi ke mempool
		blockchain.Mempool = append(blockchain.Mempool, tx)

		// Update kepemilikan item (langsung, atau setelah transaksi dikonfirmasi di blockchain)
		item.Owner = req.BuyerAddress
		item.IsListed = false
		SaveMarket(Market)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Purchase successful, transaction submitted",
			"item":    item,
		})
	}
}

// Fungsi untuk mengambil encrypted private key dari DB berdasarkan address
func GetEncryptedPrivateKeyFromDB(address string) (string, error) {
	db, err := openMarketDB()
	if err != nil {
		return "", err
	}
	defer db.Close()

	var encryptedPrivKey string
	err = db.QueryRow("SELECT private_key FROM wallets WHERE address = ?", address).Scan(&encryptedPrivKey)
	if err != nil {
		return "", err
	}
	return encryptedPrivKey, nil
}

// Fungsi buat transaksi beli dan sign
func BuyMarket(address, to string, amount float64, secretKey []byte) error {
	// 1. Ambil encrypted private key dari DB
	encryptedPrivKey, err := GetEncryptedPrivateKeyFromDB(address)
	if err != nil {
		return err
	}

	// 2. Dekripsi private key
	privKeyStr, err := wallets.DecryptPrivateKey(encryptedPrivKey, secretKey)
	if err != nil {
		return err
	}

	// 3. Generate private key object (contoh menggunakan crypto/ecdsa)
	privKey, err := LoadECDSAPrivateKeyFromString(privKeyStr)
	if err != nil {
		return err
	}

	// 4. Buat transaksi
	tx := types.Transaction{
		Sender:    address,
		Recipient: to,
		Amount:    amount,
		// ...
	}

	// 5. Sign transaksi dengan private key
	err = transaction.SignTransaction(privKey, &tx)
	if err != nil {
		return err
	}

	// 6. Submit transaksi ke blockchain / masukkan ke mempool
	blockchain.Mempool = append(blockchain.Mempool, tx)

	return nil
}

func ListHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET allowed", http.StatusMethodNotAllowed)
		return
	}

	var listedItems []MarketItem
	for _, item := range Market {
		if item.IsListed {
			listedItems = append(listedItems, item)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(listedItems)
}

func LoadECDSAPrivateKeyFromString(privKeyStr string) (*ecdsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(privKeyStr))
	if block == nil || block.Type != "EC PRIVATE KEY" {
		return nil, errors.New("failed to decode PEM block containing EC private key")
	}
	key, err := x509.ParseECPrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return key, nil
}
