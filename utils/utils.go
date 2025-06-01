package utils

import (
	"blockchain-dev1/blockchain"
	"blockchain-dev1/types"
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/mr-tron/base58" // run `go get github.com/mr-tron/base58`
	"github.com/tyler-smith/go-bip39"
	"golang.org/x/crypto/ripemd160"
)

const addressVersion byte = 0x00 // Bitcoin mainnet version byte

func SHA256(data []byte) []byte {
	hash := sha256.Sum256(data)
	return hash[:]
}

func GetAddress(pubKeyBytes []byte) string {
	// Step 1: SHA256
	shaHash := sha256.Sum256(pubKeyBytes)

	// Step 2: RIPEMD160
	ripemdHasher := ripemd160.New()
	_, err := ripemdHasher.Write(shaHash[:])
	if err != nil {
		return ""
	}
	pubKeyHash := ripemdHasher.Sum(nil)

	// Step 3: Add version byte in front
	versionedPayload := append([]byte{addressVersion}, pubKeyHash...)

	// Step 4: Checksum = first 4 bytes of double SHA256
	first := sha256.Sum256(versionedPayload)
	second := sha256.Sum256(first[:])
	checksum := second[:4]

	// Step 5: Full payload = versioned payload + checksum
	fullPayload := append(versionedPayload, checksum...)

	// Step 6: Base58 encoding
	address := base58.Encode(fullPayload)
	return address
}

func IsValidAddress(address string) bool {
	decoded, err := base58.Decode(address)
	if err != nil || len(decoded) != 25 {
		return false
	}
	payload := decoded[:21]
	checksum := decoded[21:]
	first := sha256.Sum256(payload)
	second := sha256.Sum256(first[:])
	return bytes.Equal(checksum, second[:4])
}

func ChainIsValid(chain []types.Block) bool {
	for i := 1; i < len(chain); i++ {
		prev := chain[i-1]
		curr := chain[i]

		if curr.PrevHash != prev.Hash {
			fmt.Printf("Invalid PrevHash at block %d\n", i)
			return false
		}
		if blockchain.CalculateHash(curr) != curr.Hash {
			fmt.Printf("Invalid Hash at block %d\n", i)
			return false
		}
		if !ValidPoW(curr.Hash) {
			return false
		}
	}
	return true
}

// ValidPoW checks if the hash meets the proof-of-work requirement (e.g., leading zeros)
func ValidPoW(hash string) bool {
	// Example: require hash to start with four zeros (adjust as needed)
	const difficulty = 4
	prefix := ""
	for i := 0; i < difficulty; i++ {
		prefix += "0"
	}
	return len(hash) >= difficulty && hash[:difficulty] == prefix
}

// ChainIsValidWithFuncs allows injecting custom hash and PoW functions for testing
func ChainIsValidWithFuncs(chain []types.Block, calcHash func(types.Block) string, validPoW func(string) bool) bool {
	for i := 1; i < len(chain); i++ {
		prev := chain[i-1]
		curr := chain[i]

		if curr.PrevHash != prev.Hash {
			return false
		}
		if calcHash(curr) != curr.Hash {
			return false
		}
		if !validPoW(curr.Hash) {
			return false
		}
	}
	return true
}

func LoadPrivateKeyFromString(privKeyPEM string) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(privKeyPEM))
	if block == nil {
		return nil, errors.New("failed to decode PEM block containing private key")
	}

	privKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err == nil {
		return privKey, nil
	}

	// Jika gagal parse PKCS1, coba parse PKCS8
	keyInterface, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, errors.New("failed to parse private key")
	}

	privKey, ok := keyInterface.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("not an RSA private key")
	}
	return privKey, nil
}

// HashMnemonic ke key 32 byte untuk AES
func HashMnemonic(mnemonic string) []byte {
	hash := sha256.Sum256([]byte(mnemonic))
	return hash[:]
}

func SafeBase64Decode(s string) ([]byte, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil, errors.New("base64 string is empty")
	}
	return base64.StdEncoding.DecodeString(s)
}

func SafeBase64Encode(data []byte) string {
	if data == nil || len(data) == 0 {
		return ""
	}
	return base64.StdEncoding.EncodeToString(data)
}

// Terima privateKeyBase64 string terenkripsi,
// secretKey 32 bytes,
// return hasil decrypt private key (plaintext bytes) atau error
func DecryptPrivateKeyFromBase64(privateKeyBase64 string, secretKey []byte) ([]byte, error) {
	// decode base64 dulu
	ciphertext, err := base64.StdEncoding.DecodeString(privateKeyBase64)
	if err != nil {
		return nil, err
	}

	if len(secretKey) != 32 {
		return nil, errors.New("secretKey must be 32 bytes for AES-256")
	}
	if len(ciphertext) < aes.BlockSize {
		return nil, errors.New("ciphertext too short")
	}

	iv := ciphertext[:aes.BlockSize]
	ciphertextData := ciphertext[aes.BlockSize:]

	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return nil, err
	}

	mode := cipher.NewCFBDecrypter(block, iv)
	plaintext := make([]byte, len(ciphertextData))
	mode.XORKeyStream(plaintext, ciphertextData)

	return plaintext, nil
}

// PKCS7 Padding
func pkcs7Pad(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padText := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(data, padText...)
}

func pkcs7Unpad(data []byte) ([]byte, error) {
	length := len(data)
	if length == 0 {
		return nil, errors.New("pkcs7: data is empty")
	}
	padding := int(data[length-1])
	if padding > length || padding == 0 {
		return nil, errors.New("pkcs7: invalid padding size")
	}
	for i := length - padding; i < length; i++ {
		if data[i] != byte(padding) {
			return nil, errors.New("pkcs7: invalid padding bytes")
		}
	}
	return data[:length-padding], nil
}

// Encrypt private key bytes with AES-CBC + PKCS7
func encryptAESPKCS7(plainText, key []byte) ([]byte, error) {
	hashedKey := sha256.Sum256(key)
	block, err := aes.NewCipher(hashedKey[:])
	if err != nil {
		return nil, err
	}
	plainText = pkcs7Pad(plainText, aes.BlockSize)
	cipherText := make([]byte, aes.BlockSize+len(plainText))
	iv := cipherText[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}
	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(cipherText[aes.BlockSize:], plainText)
	return cipherText, nil
}

// Decrypt AES-CBC + PKCS7 encrypted data
func decryptAESPKCS7(cipherText, key []byte) ([]byte, error) {
	hashedKey := sha256.Sum256(key)
	block, err := aes.NewCipher(hashedKey[:])
	if err != nil {
		return nil, err
	}
	if len(cipherText) < aes.BlockSize {
		return nil, errors.New("ciphertext too short")
	}
	iv := cipherText[:aes.BlockSize]
	cipherText = cipherText[aes.BlockSize:]
	if len(cipherText)%aes.BlockSize != 0 {
		return nil, errors.New("ciphertext is not a multiple of the block size")
	}
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(cipherText, cipherText)
	return pkcs7Unpad(cipherText)
}

// Contoh: simpan private key terenkripsi dalam base64
func EncryptPrivateKeyBase64(priv *ecdsa.PrivateKey, secretKey []byte) (string, error) {
	privBytes, err := x509.MarshalECPrivateKey(priv)
	if err != nil {
		return "", err
	}
	encBytes, err := encryptAESPKCS7(privBytes, secretKey)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(encBytes), nil
}

// Contoh: load private key dari base64 terenkripsi dan decrypt
func DecryptPrivateKeyBase64(encB64 string, secretKey []byte) (*ecdsa.PrivateKey, error) {
	encBytes, err := base64.StdEncoding.DecodeString(encB64)
	if err != nil {
		return nil, err
	}
	privBytes, err := decryptAESPKCS7(encBytes, secretKey)
	if err != nil {
		return nil, err
	}

	ecdsaKey, err := ParseECDSAPrivateKey(privBytes)
	if err != nil {
		return nil, errors.New("failed to parse ECDSA private key")
	}
	// Untuk debugging, tampilkan panjang dan hex dari privBytes
	// fmt.Printf("Decrypted privBytes length: %d\n", len(privBytes))
	// fmt.Printf("privBytes (hex): %x\n", privBytes)

	return ecdsaKey, nil
	// return privKey, nil
}

// Generate secret key dari mnemonic (contoh)
func GenerateSecretKeyFromMnemonic(mnemonic string) []byte {
	seed := sha256.Sum256([]byte(mnemonic))
	return seed[:]
}

func GenereateMnemonic() (string, error) {
	entropy, err := bip39.NewEntropy(128) // 128 bit entropy untuk 12 kata mnemonic
	if err != nil {
		return "", err
	}

	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return "", err
	}

	return mnemonic, nil
}

func ParseECDSAPrivateKey(privBytes []byte) (*ecdsa.PrivateKey, error) {
	// Try ECPrivateKey format
	if key, err := x509.ParseECPrivateKey(privBytes); err == nil {
		return key, nil
	}

	// Try PKCS#8 format
	if key, err := x509.ParsePKCS8PrivateKey(privBytes); err == nil {
		if ecdsaKey, ok := key.(*ecdsa.PrivateKey); ok {
			return ecdsaKey, nil
		}
	}

	return nil, errors.New("failed to parse private key")
}
