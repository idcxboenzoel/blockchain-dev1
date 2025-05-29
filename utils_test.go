package main

import (
	"testing"
)

func TestIsValidAddress(t *testing.T) {
	// Generate a public key (simulate)
	pubKey := []byte("test-public-key")
	address := GetAddress(pubKey)
	if !IsValidAddress(address) {
		t.Errorf("Expected valid address, got invalid")
	}

	// Tamper with address
	badAddress := address[:len(address)-1] + "X"
	if IsValidAddress(badAddress) {
		t.Errorf("Expected invalid address, got valid")
	}
}

func TestChainIsValid(t *testing.T) {
	// Create a simple valid chain
	genesis := Block{Index: 0, PrevHash: "", Hash: "0000abcd", Nonce: 0}
	block1 := Block{Index: 1, PrevHash: genesis.Hash, Hash: "0000efgh", Nonce: 1}
	chain := []Block{genesis, block1}

	testCalculateHash := func(b Block) string { return b.Hash }
	testValidPoW := func(hash string) bool { return hash[:4] == "0000" }

	if !ChainIsValidWithFuncs(chain, testCalculateHash, testValidPoW) {
		t.Errorf("Expected valid chain, got invalid")
	}

	// Tamper with PrevHash
	block1.PrevHash = "bad"
	chain = []Block{genesis, block1}
	if ChainIsValidWithFuncs(chain, testCalculateHash, testValidPoW) {
		t.Errorf("Expected invalid chain, got valid")
	}
}
