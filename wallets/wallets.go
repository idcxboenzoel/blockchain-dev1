package wallets

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"database/sql"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"github.com/tyler-smith/go-bip39"

	"blockchain-dev1/utils"
)

const WalletFileDefault = ""

type Wallet struct {
	Address    string
	PublicKey  string // base64
	PrivateKey string //
	//  terenkripsi, base64
}

// Global secretKey, diisi saat generate mnemonic
var secretKey []byte
var mnemonicPhrase string

func encryptAES(plainText []byte, key []byte) ([]byte, error) {
	hashedKey := sha256.Sum256(key) // 32-byte AES-256 key
	block, err := aes.NewCipher(hashedKey[:])
	if err != nil {
		return nil, err
	}
	cipherText := make([]byte, aes.BlockSize+len(plainText))
	iv := cipherText[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}
	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(cipherText[aes.BlockSize:], plainText)
	return cipherText, nil
}

func decryptAES(cipherText []byte, key []byte) ([]byte, error) {
	hashedKey := sha256.Sum256(key) // 32-byte AES-256 key
	block, err := aes.NewCipher(hashedKey[:])
	if err != nil {
		return nil, err
	}
	iv := cipherText[:aes.BlockSize]
	cipherText = cipherText[aes.BlockSize:]
	decrypted := make([]byte, len(cipherText))
	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(decrypted, cipherText)
	return decrypted, nil
}

func CreateWallet(filename string) error {
	if _, err := os.Stat(filename); err == nil {
		return fmt.Errorf("wallet file %s already exists", filename)
	}

	priv, err := GenerateKeyPair()
	if err != nil {
		return err
	}
	return SavePrivateKey(priv, filename)
}

func GenerateKeyPair() (*ecdsa.PrivateKey, error) {
	return ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
}

func SavePrivateKey(priv *ecdsa.PrivateKey, filename string) error {
	b, err := x509.MarshalECPrivateKey(priv)
	if err != nil {
		return err
	}
	privPem := pem.EncodeToMemory(&pem.Block{
		Type:  "EC PRIVATE KEY",
		Bytes: b,
	})
	return ioutil.WriteFile(filename, privPem, 0600)
}

func LoadPrivateKey(filename string) (*ecdsa.PrivateKey, error) {
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil || block.Type != "EC PRIVATE KEY" {
		return nil, fmt.Errorf("invalid PEM file")
	}
	return x509.ParseECPrivateKey(block.Bytes)
}

func openWalletDB() (*sql.DB, error) {
	return sql.Open("sqlite3", "wallets.db")
}

func InitWalletDB() error {
	db, err := openWalletDB()
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT UNIQUE,
        privkey BLOB
    )`)
	return err
}

func SaveWalletToDB(w Wallet) error {
	db, err := openWalletDB()
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec(`
		INSERT INTO wallets (address, public_key, private_key)
		VALUES (?, ?, ?)
		ON CONFLICT(address) DO UPDATE SET
			public_key = excluded.public_key,
			private_key = excluded.private_key
	`, w.Address, w.PublicKey, w.PrivateKey)
	return err
}

func LoadWalletFromDB(address string, mnemonic string) (*ecdsa.PrivateKey, error) {
	db, err := openWalletDB()
	if err != nil {
		return nil, err
	}
	defer db.Close()
	row := db.QueryRow(`SELECT private_key FROM wallets WHERE address = ?`, address)
	var encryptedPrivB64 string
	if err := row.Scan(&encryptedPrivB64); err != nil {
		return nil, err
	}

	cleanB64 := strings.TrimSpace(encryptedPrivB64)
	cleanB64 = strings.ReplaceAll(cleanB64, "\n", "")
	cleanB64 = strings.ReplaceAll(cleanB64, "\r", "")

	secretKey := utils.GenerateSecretKeyFromMnemonic(mnemonic)

	fmt.Printf("Private key base64 from DB: %q\n", cleanB64)
	fmt.Printf("Secret key: %x\n", secretKey)

	decoded, err := base64.StdEncoding.DecodeString(cleanB64)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64: %w", err)
	}
	fmt.Println("Base64 decoded length:", len(decoded))

	loadedPriv, err := utils.DecryptPrivateKeyBase64(cleanB64, secretKey)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt private key: %w", err)
	}

	return loadedPriv, nil
}

func CreateWalletInDB() (string, string, error) {
	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return "", "", err
	}

	pubKeyBytes, _ := x509.MarshalPKIXPublicKey(&priv.PublicKey)
	pubKeyB64 := utils.SafeBase64Encode(pubKeyBytes)
	address := utils.GetAddress(pubKeyBytes)

	mnemonicPhrase, err := utils.GenereateMnemonic()
	if err != nil {
		return "", "", err
	}
	secretKey := utils.GenerateSecretKeyFromMnemonic(mnemonicPhrase)

	encPrivB64, err := utils.EncryptPrivateKeyBase64(priv, secretKey)
	if err != nil {
		return "", "", err
	}

	wallet := Wallet{
		Address:    address,
		PublicKey:  pubKeyB64,
		PrivateKey: encPrivB64,
	}

	return address, mnemonicPhrase, SaveWalletToDB(wallet)
}

type WalletInfo struct {
	PrivateKey string `json:"private_key"`
	PublicKey  string `json:"public_key"`
}

func LoadWalletByAddress(address string, mnemonicPhrase string) (privateKey *ecdsa.PrivateKey, err error) {
	priv, err := LoadWalletFromDB(address, mnemonicPhrase)
	if err != nil {
		return nil, err
	}
	// pubKeyBytes, err := x509.MarshalPKIXPublicKey(&priv.PublicKey)
	// if err != nil {
	// 	return nil, err
	// }
	// privPem := pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: privBytes})
	// pubPem := pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: pubKeyBytes})
	return priv, nil
}

func GetWalletByAddress(db *sql.DB, address string) (*Wallet, error) {
	row := db.QueryRow(`SELECT address, public_key, private_key FROM wallets WHERE address = ?`, address)
	var w Wallet
	err := row.Scan(&w.Address, &w.PublicKey, &w.PrivateKey)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func GenerateSecretKeyFromMnemonic() ([]byte, string, error) {
	entropy, err := bip39.NewEntropy(128) // 128 bit entropy untuk 12 kata mnemonic
	if err != nil {
		return nil, "", err
	}

	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return nil, "", err
	}

	seed := bip39.NewSeed(mnemonic, "")

	key := sha256.Sum256(seed) // 32 bytes key dari SHA256(seed)

	return key[:], mnemonic, nil
}

func GenerateSecretKeyFromDataMnemonic(mneomnic string) ([]byte, string, error) {

	seed := bip39.NewSeed(mneomnic, "")

	key := sha256.Sum256(seed) // 32 bytes key dari SHA256(seed)

	return key[:], mneomnic, nil
}

func DecryptPrivateKey(encryptedPrivKey string, secretKey []byte) (string, error) {
	// Decode base64
	ciphertext, err := utils.SafeBase64Decode(encryptedPrivKey)
	if err != nil {
		return "", err
	}
	if len(secretKey) != 32 {
		return "", errors.New("secretKey must be 32 bytes for AES-256")
	}
	if len(ciphertext) < aes.BlockSize {
		return "", errors.New("ciphertext too short")
	}
	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(ciphertext, ciphertext)

	// Remove PKCS7 padding
	paddingLen := int(ciphertext[len(ciphertext)-1])
	if paddingLen > len(ciphertext) {
		return "", errors.New("invalid padding size")
	}
	plaintext := ciphertext[:len(ciphertext)-paddingLen]

	return string(plaintext), nil
}
