package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"strconv"
	"strings"
)

type Block struct {
	Index        int
	Timestamp    string
	Transactions []Transaction
	PrevHash     string
	Hash         string
	Nonce        int
}

var Blockchain []Block
var Mempool []Transaction

const (
	blockchainFile = "data/blockchain.json"
	mempoolFile    = "data/mempool.json"
)

func CalculateHash(block Block) string {
	record := strconv.Itoa(block.Index) + block.Timestamp + block.PrevHash + strconv.Itoa(block.Nonce)
	for _, tx := range block.Transactions {
		record += string(tx.Serialize())
	}
	h := SHA256([]byte(record))
	return fmt.Sprintf("%x", h)
}

func SaveBlockchain(chain []Block) error {
	data, err := json.MarshalIndent(chain, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(blockchainFile, data, 0644)
}

func LoadBlockchain() ([]Block, error) {
	if _, err := os.Stat(blockchainFile); os.IsNotExist(err) {
		genesis := CreateGenesisBlock()
		return []Block{genesis}, nil
	}
	data, err := ioutil.ReadFile(blockchainFile)
	if err != nil {
		return nil, err
	}
	var chain []Block
	err = json.Unmarshal(data, &chain)
	return chain, err
}

func SaveMempool(mempool []Transaction) error {
	data, err := json.MarshalIndent(mempool, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(mempoolFile, data, 0644)
}

func LoadMempool() ([]Transaction, error) {
	if _, err := os.Stat(mempoolFile); os.IsNotExist(err) {
		return []Transaction{}, nil
	}
	data, err := ioutil.ReadFile(mempoolFile)
	if err != nil {
		return nil, err
	}
	var mempool []Transaction
	err = json.Unmarshal(data, &mempool)
	return mempool, err
}

func CreateGenesisBlock() Block {
	genesis := Block{
		Index:        0,
		Timestamp:    "",
		Transactions: []Transaction{},
		PrevHash:     "",
		Nonce:        0,
	}
	genesis.Hash = CalculateHash(genesis)
	return genesis
}

// LoadState loads blockchain and mempool to global vars
func LoadState() error {
	var err error
	Blockchain, err = LoadBlockchain()
	if err != nil {
		return err
	}
	Mempool, err = LoadMempool()
	return err
}

func GetBalance(address string) float64 {
	balance := 0.0
	for _, block := range Blockchain {
		for _, tx := range block.Transactions {
			if tx.Sender == address {
				balance -= tx.Amount
			}
			if tx.Recipient == address {
				balance += tx.Amount
			}
		}
	}
	for _, tx := range Mempool {
		if tx.Sender == address {
			balance -= tx.Amount
		}
	}
	return balance
}

// GetBlockReward returns the mining reward for a given block height.
// After the first block (genesis), only transaction fees are rewarded (no new coins minted).
func GetBlockReward(height int) float64 {
	if height == 0 {
		// Genesis block, no reward
		return 0
	}
	// No block subsidy after genesis, only transaction fees
	return 0
}

// CalculateFees sums all transaction fees in a block (excluding coinbase).
func CalculateFees(transactions []Transaction) float64 {
	totalFees := 0.0
	for _, tx := range transactions {
		if tx.Sender != "" {
			totalFees += tx.Fee
		}
	}
	return totalFees
}

const maxSupply = 30000000.0 // 21 million coins like Bitcoin, custom

func TotalSupply() float64 {
	total := 0.0
	for _, block := range Blockchain {
		for _, tx := range block.Transactions {
			// Only count coinbase (mining reward) transactions
			if tx.Sender == "" {
				total += tx.Amount
			}
		}
	}
	return total
}

func miningQuiz() bool {
	a := rand.Intn(10) + 1
	b := rand.Intn(10) + 1
	answer := a + b
	fmt.Printf("Quiz: What is %d + %d? ", a, b)
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)
	userAnswer, err := strconv.Atoi(input)
	if err != nil || userAnswer != answer {
		fmt.Println("Incorrect! Mining aborted.")
		return false
	}
	fmt.Println("Correct! Mining will proceed.")
	return true
}
