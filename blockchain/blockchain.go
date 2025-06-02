package blockchain

import (
	"blockchain-dev1/types"
	"bufio"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"strconv"
	"strings"
)

var Blockchain []types.Block
var Mempool []types.Transaction

const (
	blockchainFile = "data/blockchain.json"
	mempoolFile    = "data/mempool.json"
)

func InitBlockchain() []types.Block {
	// Load existing blockchain and mempool from files
	var err error
	Blockchain, err = LoadBlockchain()
	if err != nil {
		fmt.Println("Error loading blockchain:", err)
		os.Exit(1)
	}

	return Blockchain
}

// IsValidBlock checks if a new block is valid based on the previous block.
func IsValidBlock(newBlock, prevBlock types.Block) bool {
	// Example validation: index and previous hash check
	if newBlock.Index != prevBlock.Index+1 {
		return false
	}
	if newBlock.PrevHash != prevBlock.Hash {
		return false
	}
	// Add more validation as needed (e.g., hash, proof-of-work, etc.)
	return true
}

func CalculateHash(block types.Block) string {
	record := strconv.Itoa(block.Index) + block.Timestamp + block.PrevHash + strconv.Itoa(block.Nonce)
	for _, tx := range block.Transactions {
		txBytes, _ := json.Marshal(tx)
		record += string(txBytes)
	}
	h := sha256.Sum256([]byte(record))
	return fmt.Sprintf("%x", h[:])
}

func SaveBlockchain(chain []types.Block) error {
	data, err := json.MarshalIndent(chain, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(blockchainFile, data, 0644)
}

func GetBlockByIndex(index int) (*types.Block, error) {
	for _, block := range Blockchain {
		if block.Index == index {
			return &block, nil
		}
	}
	return nil, fmt.Errorf("block with index %d not found", index)
}

func LoadBlockchain() ([]types.Block, error) {
	if _, err := os.Stat(blockchainFile); os.IsNotExist(err) {
		genesis := CreateGenesisBlock()
		return []types.Block{genesis}, nil
	}
	data, err := ioutil.ReadFile(blockchainFile)
	if err != nil {
		return nil, err
	}
	var chain []types.Block
	err = json.Unmarshal(data, &chain)
	return chain, err
}

func SaveMempool(mempool []types.Transaction) error {
	data, err := json.MarshalIndent(mempool, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(mempoolFile, data, 0644)
}

func LoadMempool() ([]types.Transaction, error) {
	if _, err := os.Stat(mempoolFile); os.IsNotExist(err) {
		return []types.Transaction{}, nil
	}
	data, err := ioutil.ReadFile(mempoolFile)
	if err != nil {
		return nil, err
	}
	var mempool []types.Transaction
	err = json.Unmarshal(data, &mempool)
	return mempool, err
}

func CreateGenesisBlock() types.Block {
	genesis := types.Block{
		Index:        0,
		Timestamp:    "",
		Transactions: []types.Transaction{},
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
	halvingInterval := 300000
	initialReward := 50.0
	reward := initialReward

	halvings := height / halvingInterval
	for i := 0; i < halvings; i++ {
		reward /= 2
		if reward < 0.00000001 {
			reward = 0
			break
		}
	}

	// Cap total supply
	if TotalSupply()+reward > maxSupply {
		reward = maxSupply - TotalSupply()
		if reward < 0 {
			reward = 0
		}
	}

	return reward
}

// CalculateFees sums all transaction fees in a block (excluding coinbase).
func CalculateFees(transactions []types.Transaction) float64 {
	totalFees := 0.0
	for _, tx := range transactions {
		if tx.Sender != "" {
			// Fee is proportional to transaction size in bytes
			txBytes, _ := json.Marshal(tx)
			size := float64(len(txBytes))
			totalFees += tx.Fee * size
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

func RemoveTxFromMempool(txID string) {
	newMempool := []types.Transaction{}
	for _, tx := range Mempool {
		if tx.ID != txID {
			newMempool = append(newMempool, tx)
		}
	}
	Mempool = newMempool
	SaveMempool(Mempool) // simpan perubahan
}

func CleanMempool(filter func(types.Transaction) bool) {
	newMempool := []types.Transaction{}
	for _, tx := range Mempool {
		if filter(tx) {
			newMempool = append(newMempool, tx)
		}
	}
	Mempool = newMempool
	SaveMempool(Mempool)
}

func ClearMempool() {
	Mempool = []types.Transaction{}
	SaveMempool(Mempool)
}

func cleanMempoolSelected() {
	// Hapus semua transaksi dengan fee < 0.001
	CleanMempool(func(tx types.Transaction) bool {
		return tx.Fee >= 0.001
	})

	// Atau hapus transaksi dari alamat tertentu
	CleanMempool(func(tx types.Transaction) bool {
		return tx.Sender != "alamat_tidak_diinginkan"
	})
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

func AddTransactionToMempool(tx types.Transaction) {
	// Check if transaction already exists in mempool
	for _, existingTx := range Mempool {
		if existingTx.ID == tx.ID {
			fmt.Println("Transaction already exists in mempool:", tx.ID)
			return
		}
	}

	// Add transaction to mempool
	Mempool = append(Mempool, tx)
	fmt.Println("Transaction added to mempool:", tx.ID)

	// Save updated mempool to file
	err := SaveMempool(Mempool)
	if err != nil {
		fmt.Println("Error saving mempool:", err)
	}
}

func AddBlockIfValid(newBlock types.Block) bool {
	if len(Blockchain) == 0 {
		fmt.Println("Blockchain is empty, adding genesis block")
		newBlock.Index = 0
		newBlock.PrevHash = ""
		newBlock.Hash = CalculateHash(newBlock)
		Blockchain = append(Blockchain, newBlock)
		return true
	}

	prevBlock := Blockchain[len(Blockchain)-1]
	if !IsValidBlock(newBlock, prevBlock) {
		fmt.Println("Invalid block:", newBlock.Index)
		return false
	}

	newBlock.Index = prevBlock.Index + 1
	newBlock.PrevHash = prevBlock.Hash
	newBlock.Hash = CalculateHash(newBlock)

	Blockchain = append(Blockchain, newBlock)
	err := SaveBlockchain(Blockchain)
	if err != nil {
		fmt.Println("Error saving blockchain:", err)
		return false
	}

	fmt.Println("New block added:", newBlock.Index)
	return true
}
