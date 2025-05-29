package main

import (
	"bytes"
	"crypto/sha256"
	"fmt"

	"github.com/mr-tron/base58" // run `go get github.com/mr-tron/base58`
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

func ChainIsValid(chain []Block) bool {
	for i := 1; i < len(chain); i++ {
		prev := chain[i-1]
		curr := chain[i]

		if curr.PrevHash != prev.Hash {
			fmt.Printf("Invalid PrevHash at block %d\n", i)
			return false
		}
		if CalculateHash(curr) != curr.Hash {
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
func ChainIsValidWithFuncs(chain []Block, calcHash func(Block) string, validPoW func(string) bool) bool {
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
