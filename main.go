package main

import (
	"crypto/sha256"
	"fmt"
	"strconv"
	"time"
)

type Block struct {
	Index     int
	Timestamp string
	Data      string
	PrevHash  string
	Hash      string
	Nonce     int
}

var Blockchain []Block

// SHA256 hashing
func calculateHash(block Block) string {
	record := strconv.Itoa(block.Index) + block.Timestamp + block.Data + block.PrevHash + strconv.Itoa(block.Nonce)
	h := sha256.New()
	h.Write([]byte(record))
	return fmt.Sprintf("%x", h.Sum(nil))
}

// Proof of Work (difficulty = 2 leading zeros)
func mineBlock(block *Block, difficulty int) {
	for {
		block.Hash = calculateHash(*block)
		if block.Hash[:difficulty] == string(make([]byte, difficulty)) {
			break
		}
		block.Nonce++
	}
}

func generateBlock(oldBlock Block, data string) Block {
	newBlock := Block{
		Index:     oldBlock.Index + 1,
		Timestamp: time.Now().String(),
		Data:      data,
		PrevHash:  oldBlock.Hash,
		Nonce:     0,
	}
	mineBlock(&newBlock, 2)
	return newBlock
}

func main() {
	genesisBlock := Block{
		Index:     0,
		Timestamp: time.Now().String(),
		Data:      "Genesis Block",
		PrevHash:  "",
		Nonce:     0,
	}
	genesisBlock.Hash = calculateHash(genesisBlock)
	Blockchain = append(Blockchain, genesisBlock)

	// Add 5 blocks
	for i := 1; i <= 5; i++ {
		newBlock := generateBlock(Blockchain[i-1], fmt.Sprintf("Block %d Data", i))
		Blockchain = append(Blockchain, newBlock)
	}

	for _, block := range Blockchain {
		fmt.Printf("%+v\n\n", block)
	}
}
