package main

import (
	"blockchain-dev1/blockchain"
	"blockchain-dev1/market"
	"blockchain-dev1/transaction"
	"blockchain-dev1/types"
	"blockchain-dev1/utils"
	"blockchain-dev1/wallets"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/rs/cors"
)

const (
	apiKeyHeader   = "X-API-Key"
	requiredAPIKey = "your-secure-api-key" // Change to your secret key, store safely
	listenAddr     = ":8443"
	certFile       = "server.crt" // TLS certificate
	keyFile        = "server.key" // TLS private key
)

var (
	miningMu sync.Mutex
)

const difficulty = 4 // Number of leading zeros required

func main() {
	err, errDb := blockchain.LoadState(), wallets.InitWalletDB()
	if err != nil {
		log.Fatal(err)
	}
	if errDb != nil {
		log.Fatal("Failed to initialize wallets DB: ", errDb)
	}
	if !utils.ChainIsValid(blockchain.Blockchain) {
		log.Fatal("Blockchain invalid or tampered")
	}

	loadedMarket, err := market.LoadMarket()
	if err != nil {
		fmt.Println("Failed to load market:", err)
		os.Exit(1)
	}
	market.Market = loadedMarket

	mux := http.NewServeMux()

	routes(mux)
	// market
	market.MarketHandler(mux)

	// Allow frontend requests (adjust origins as needed)
	// CORS configuration
	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}).Handler(mux)

	server := &http.Server{
		Addr:         "0.0.0.0" + listenAddr,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 20 * time.Second,
	}

	log.Printf("Starting secure blockchain server on https://%s\n", listenAddr)
	err = server.ListenAndServeTLS(certFile, keyFile)
	if err != nil {
		log.Fatal("Server failed:", err)
	}
}

// Middleware to check API key in header for every request
func ApiKeyAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get(apiKeyHeader)
		if key != requiredAPIKey {
			http.Error(w, "Forbidden: invalid API key", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

func HandleCreateWallet(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}
	address, mnemonic, err := wallets.CreateWalletInDB()
	resp := map[string]string{}
	if err != nil {
		resp["error"] = err.Error()
	} else {
		resp["address"] = address
		resp["mnemonic"] = mnemonic
		resp["message"] = "wallets created successfully"
	}
	writeJSON(w, resp)
}

func HandleAddTx(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		From     string  `json:"from"`
		To       string  `json:"to"`
		Amount   float64 `json:"amount"`
		Mnemonic string  `json:"mnemonic"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	// Load wallets from SQLite DB using address
	privateKeyFrom, err := wallets.LoadWalletByAddress(req.From, req.Mnemonic)
	if err != nil {
		writeJSON(w, map[string]string{"error": "wallets from not found: " + err.Error()})
		return
	}

	// Load wallets from SQLite DB using address
	// privateKeyTo, err := wallets.LoadWalletByAddress(req.To, req.MnemonicTo)
	// if err != nil {
	// 	writeJSON(w, map[string]string{"error": "wallets To not found: " + err.Error()})
	// 	return
	// }

	// fromPrivKeyStr := privateKeyFrom
	// Fee as before
	const feeRateSatPerByte = 50
	const txSizeBytes = 226
	feeSatoshis := feeRateSatPerByte * txSizeBytes
	fee := float64(feeSatoshis) / 100_000_000

	if blockchain.GetBalance(req.From) < req.Amount {
		writeJSON(w, map[string]string{"error": "Insufficient balance"})
		return
	}

	tx := types.Transaction{
		Sender:    req.From,
		Recipient: req.To,
		Amount:    req.Amount,
		Fee:       fee,
	}
	tx.ID = transaction.GenerateTransactionID(tx)

	err = transaction.SignTransaction(privateKeyFrom, &tx)
	if err != nil {
		writeJSON(w, map[string]string{"error": "Failed to sign transaction: " + err.Error()})
		return
	}

	if transaction.VerifyTransaction(&tx) {
		blockchain.Mempool = append(blockchain.Mempool, tx)
		blockchain.SaveMempool(blockchain.Mempool)
		writeJSON(w, map[string]string{"status": "Transaction added to mempool"})
	} else {
		writeJSON(w, map[string]string{"error": "Invalid transaction signature"})
	}
}

// Handle mining asynchronously so server is not blocked
func HandleMineAsync(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		MinerAddress string `json:"miner_address"`
		CodeOwner    string `json:"code_owner"` // Optional field for code owner
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.MinerAddress == "" {
		http.Error(w, "miner_address is required", http.StatusBadRequest)
		return
	}

	// Check code_owner
	// if req.CodeOwner != "" && req.CodeOwner == "forgotpassword" {
	// 	// code_owner is present and correct
	// 	// You can allow mining even if mempool is empty, or perform special logic here
	// } else if len(blockchain.Mempool) == 0 {
	// 	http.Error(w, "No transactions to mine", http.StatusBadRequest)
	// 	return
	// }

	// Lock mining to prevent concurrent mining jobs
	miningMu.Lock()
	go func(miner string) {
		defer miningMu.Unlock()
		mining(miner)
	}(req.MinerAddress)

	writeJSON(w, map[string]string{"status": "Mining started asynchronously"})
}

// func HandleGetBlock(w http.ResponseWriter, r *http.Request) {
// 	index := r.URL.Query().Get("index")
// 	if index == "" {
// 		http.Error(w, "Missing index parameter", http.StatusBadRequest)
// 		return
// 	}
// 	block, err := blockchain.GetBlockByIndex(index)
// 	if err != nil {
// 		http.Error(w, "Block not found", http.StatusNotFound)
// 		return
// 	}
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(block)
// }

// func HandleGetBlockByHash(w http.ResponseWriter, r *http.Request) {
// 	hash := r.URL.Query().Get("hash")
// 	if hash == "" {
// 		http.Error(w, "Missing hash parameter", http.StatusBadRequest)
// 		return
// 	}
// 	block, err := blockchain.GetBlockByHash(hash)
// 	if err != nil {
// 		http.Error(w, "Block not found", http.StatusNotFound)
// 		return
// 	}
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(block)
// }

// func HandleGetBlocksByAddress(w http.ResponseWriter, r *http.Request) {
// 	address := r.URL.Query().Get("address")
// 	if address == "" {
// 		http.Error(w, "Missing address parameter", http.StatusBadRequest)
// 		return
// 	}

// 	blocks := blockchain.GetBlocksByAddress(address)
// 	if len(blocks) == 0 {
// 		http.Error(w, "No blocks found for this address", http.StatusNotFound)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(blocks)
// }

// func HandleGetListBlockByTimestamp(w http.ResponseWriter, r *http.Request) {
// 	timestamp := r.URL.Query().Get("timestamp")
// 	if timestamp == "" {
// 		http.Error(w, "Missing timestamp parameter", http.StatusBadRequest)
// 		return
// 	}

// 	blocks, err := blockchain.GetBlocksByTimestamp(timestamp)
// 	if err != nil {
// 		http.Error(w, "Error retrieving blocks: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	if len(blocks) == 0 {
// 		http.Error(w, "No blocks found for this timestamp", http.StatusNotFound)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(blocks)
// }

// func HandleGetListBlockByDate(w http.ResponseWriter, r *http.Request) {
// 	date := r.URL.Query().Get("date")
// 	if date == "" {
// 		http.Error(w, "Missing date parameter", http.StatusBadRequest)
// 		return
// 	}

// 	blocks, err := blockchain.GetBlocksByDate(date)
// 	if err != nil {
// 		http.Error(w, "Error retrieving blocks: "+err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	if len(blocks) == 0 {
// 		http.Error(w, "No blocks found for this date", http.StatusNotFound)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(blocks)
// }

func HandleGetListAllBlocks(w http.ResponseWriter, r *http.Request) {
	blocks := blockchain.Blockchain
	if len(blocks) == 0 {
		http.Error(w, "No blocks found", http.StatusNotFound)
		return
	}

	// Order by ascending index (newest first)
	ordered := make([]types.Block, len(blocks))
	copy(ordered, blocks)
	// Reverse slice: newest block first
	for i, j := 0, len(ordered)-1; i < j; i, j = i+1, j-1 {
		ordered[i], ordered[j] = ordered[j], ordered[i]
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ordered)
}

func HandleGetBlockByIndex(w http.ResponseWriter, r *http.Request) {
	indexStr := r.URL.Query().Get("index")
	if indexStr == "" {
		http.Error(w, "Missing index parameter", http.StatusBadRequest)
		return
	}
	var index int
	if _, err := fmt.Sscanf(indexStr, "%d", &index); err != nil {
		http.Error(w, "Invalid index parameter", http.StatusBadRequest)
		return
	}

	block, err := blockchain.GetBlockByIndex(index)
	if err != nil {
		http.Error(w, "Block not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(block)
}

func HandlerGetWallet(w http.ResponseWriter, r *http.Request) {
	address := r.URL.Query().Get("address")
	if address == "" {
		http.Error(w, "Missing address parameter", http.StatusBadRequest)
		return
	}

	mnemonicPhrase := r.URL.Query().Get("mnemonic")
	if mnemonicPhrase == "" {
		http.Error(w, "Missing mnemonic parameter", http.StatusBadRequest)
		return
	}

	wallets, err := wallets.LoadWalletByAddress(address, mnemonicPhrase)
	if err != nil {
		http.Error(w, "wallets not found", http.StatusNotFound)
		return
	}

	// Security note: Never expose private key in production!
	pubKeyBytes, err := json.Marshal(wallets.PublicKey)
	if err != nil {
		http.Error(w, "Failed to serialize public key", http.StatusInternalServerError)
		return
	}
	response := map[string]string{
		"address":    address,
		"public_key": string(pubKeyBytes),
		// "private_key": wallets.PrivateKey, // ⚠️ only if needed/test/dev
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Mining logic moved to function for async use
func mining(minerAddress string) {
	if len(blockchain.Mempool) == 0 {
		// log.Println("No transactions to mine")
		// return
		// http.Error(w, "miner_address is required", http.StatusBadRequest)
		// return
	}

	validTxs := []types.Transaction{}
	for _, tx := range blockchain.Mempool {
		if transaction.VerifyTransaction(&tx) {
			validTxs = append(validTxs, tx)
		} else {
			log.Println("Skipping invalid tx from", tx.Sender)
		}
	}

	lastBlock := blockchain.Blockchain[len(blockchain.Blockchain)-1]
	nextBlockIndex := lastBlock.Index + 1

	const halvingInterval = 150
	const initialReward = 50.0
	halvings := nextBlockIndex / halvingInterval
	reward := initialReward / float64(uint64(1)<<uint(halvings))
	if reward < 0.00000001 {
		reward = 0
	}

	totalFees := 0.0
	for _, tx := range validTxs {
		totalFees += tx.Fee
	}
	coinbaseAmount := reward + totalFees
	if coinbaseAmount == 0 {
		log.Println("No reward or fees to mine")
		return
	}

	coinbaseTx := types.Transaction{
		Sender:    "",
		Recipient: minerAddress,
		Amount:    coinbaseAmount,
	}
	allTxs := append([]types.Transaction{coinbaseTx}, validTxs...)

	newBlock := types.Block{
		Index:        nextBlockIndex,
		Timestamp:    time.Now().String(),
		Transactions: allTxs,
		PrevHash:     lastBlock.Hash,
		Nonce:        0,
	}

	MineBlock(&newBlock)
	blockchain.Blockchain = append(blockchain.Blockchain, newBlock)
	blockchain.Mempool = []types.Transaction{}

	if !utils.ChainIsValid(blockchain.Blockchain) {
		log.Println("Blockchain invalid after mining!")
		return
	}

	blockchain.SaveBlockchain(blockchain.Blockchain)
	blockchain.SaveMempool(blockchain.Mempool)
	log.Printf("Mined block #%d with reward %.8f\n", newBlock.Index, coinbaseAmount)
}

func MineBlock(b *types.Block) {
	prefix := ""
	for i := 0; i < difficulty; i++ {
		prefix += "0"
	}
	for {
		b.Hash = blockchain.CalculateHash(*b)
		if b.Hash[:difficulty] == prefix {
			break
		}
		b.Nonce++
	}
}

func HandleBalance(w http.ResponseWriter, r *http.Request) {
	address := r.URL.Query().Get("address")
	if address == "" {
		http.Error(w, "address query parameter required", http.StatusBadRequest)
		return
	}
	balance := blockchain.GetBalance(address)
	resp := map[string]interface{}{
		"address": address,
		"balance": balance,
	}
	writeJSON(w, resp)
}

func HandlePrintChain(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, blockchain.Blockchain)
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func HandlePrintMempool(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if len(blockchain.Mempool) == 0 {
		w.Write([]byte("[]"))
		return
	}
	json.NewEncoder(w).Encode(blockchain.Mempool)
}
