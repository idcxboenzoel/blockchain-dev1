package main

import (
	"crypto/x509"
	"fmt"
	"os"
	"strconv"
	"time"
)

const difficulty = 4 // Number of leading zeros required

func main() {
	err, errDb := LoadState(), initWalletDB()
	if err != nil {
		panic(err)
	}

	if errDb != nil {
		panic("Failed to initialize wallet database: " + errDb.Error())
	}

	if !ChainIsValid(Blockchain) {
		panic("Blockchain data is invalid or has been tampered with!")
	}

	if len(os.Args) < 2 {
		printUsage()
		os.Exit(0)
	}

	command := os.Args[1]

	switch command {
	case "createwallet":
		// Create a new wallet and store it in the wallet database
		address, err := CreateWalletInDB()
		if err != nil {
			fmt.Println("Error creating wallet:", err)
			return
		}
		fmt.Println("Wallet created with address:", address)
	case "addtx":
		if len(os.Args) < 8 {
			fmt.Println("Usage: addtx -from FROM -to TO -amount AMOUNT [-wallet WALLET_FILE]")
			return
		}

		from := os.Args[3]
		to := os.Args[5]
		amount, err := strconv.ParseFloat(os.Args[7], 64)
		if err != nil {
			fmt.Println("Invalid amount")
			return
		}

		// Set a fixed fee based on size: fee = rate (sat/byte) × size (bytes)
		const feeRateSatPerByte = 50
		const txSizeBytes = 226
		feeSatoshis := feeRateSatPerByte * txSizeBytes // 11,300 satoshis
		fee := float64(feeSatoshis) / 100_000_000      // convert to BTC (0.000113)

		// Default wallet file
		walletFileToUse := walletFileDefault // your default walletFile constant, e.g., "wallet.pem"

		// Check if user passed optional -wallet argument
		for i := 8; i < len(os.Args)-1; i++ {
			if os.Args[i] == "-wallet" && i+1 < len(os.Args) {
				walletFileToUse = os.Args[i+1]
				break
			}
		}
		if len(os.Args) >= 10 && os.Args[8] == "-wallet" {
			walletFileToUse = os.Args[9]
		}

		priv, err := LoadPrivateKey(walletFileToUse)
		if err != nil {
			fmt.Println("Error loading wallet file", walletFileToUse, ":", err)
			return
		}

		pubKey := priv.PublicKey
		pubKeyBytes, err := x509.MarshalPKIXPublicKey(&pubKey)
		if err != nil {
			fmt.Println("Error marshalling public key:", err)
			return
		}
		derivedAddress := GetAddress(pubKeyBytes)
		if from != derivedAddress {
			fmt.Println("Error: The provided -from address does not match the wallet's public key.")
			return
		}

		tx := Transaction{
			Sender:    from,
			Recipient: to,
			Amount:    amount,
			Fee:       fee,
		}

		// Double-spend protection: check balance before signing
		if GetBalance(from) < amount {
			fmt.Println("Error: insufficient balance.")
			return
		}

		err = SignTransaction(priv, &tx)
		if err != nil {
			fmt.Println("Failed to sign transaction:", err)
			return
		}

		if VerifyTransaction(&tx) {
			Mempool = append(Mempool, tx)
			fmt.Println("Transaction added to mempool!")
			SaveMempool(Mempool)
		} else {
			fmt.Println("Invalid transaction signature!")
		}

	case "mine":
		mining()

	case "mineloop":
		for i := 0; i < 10000; i++ {
			fmt.Println("Mining iteration", i+1)
			mining()
			time.Sleep(1 * time.Second)
		}
		fmt.Println("Mining loop completed.")

	case "print":
		for _, block := range Blockchain {
			fmt.Printf("Index: %d, Timestamp: %s, PrevHash: %s, Hash: %s\n",
				block.Index, block.Timestamp, block.PrevHash, block.Hash)
			for _, tx := range block.Transactions {
				fmt.Printf("  TX: %s -> %s : %f\n", tx.Sender, tx.Recipient, tx.Amount)
			}
		}
	case "printwallet":
		walletFile := walletFileDefault
		if len(os.Args) > 2 {
			walletFile = os.Args[2]
		}
		priv, err := LoadPrivateKey(walletFile)
		if err != nil {
			fmt.Println("Error loading wallet:", err)
			return
		}
		pubKeyBytes, err := x509.MarshalPKIXPublicKey(&priv.PublicKey)
		if err != nil {
			fmt.Println("Error marshalling public key:", err)
			return
		}
		fmt.Printf("Public Key (hex): %x\n", pubKeyBytes)
		fmt.Println("Wallet address:", GetAddress(pubKeyBytes))
	case "balance":
		if len(os.Args) < 3 {
			fmt.Println("Usage: balance -address ADDRESS")
			return
		}
		address := os.Args[2]
		balance := GetBalance(address)
		fmt.Printf("Balance of %s: %.2f\n", address, balance)
	case "printmempool":
		if len(Mempool) == 0 {
			fmt.Println("Mempool is empty.")
		} else {
			fmt.Println("Mempool Transactions:")
			for i, tx := range Mempool {
				fmt.Printf("[%d] From: %s → To: %s | Amount: %.2f\n", i+1, tx.Sender, tx.Recipient, tx.Amount)
			}
		}
	case "printchain":
		for i, block := range Blockchain {
			fmt.Printf("Block #%d:\n", i)
			for _, tx := range block.Transactions {
				fmt.Printf("  Tx: %s → %s | Amount: %.2f\n", tx.Sender, tx.Recipient, tx.Amount)
			}
			fmt.Println()
		}
	default:
		printUsage()
	}
}

func printUsage() {
	fmt.Println("Commands:")
	fmt.Println("  createwallet           - Generate a new wallet")
	fmt.Println("  addtx -from FROM -to TO -amount AMOUNT [-wallet WALLET_FILE] - Add and sign a transaction")
	fmt.Println("  mine -miner MINER_ADDRESS      - Mine transactions into a new block")
	fmt.Println("  mineloop                - Mine blocks in a loop")
	fmt.Println("  print                   - Print blockchain (summary)")
	fmt.Println("  printwallet [WALLET_FILE] - Print wallet public key and address")
	fmt.Println("  balance -address ADDRESS - Show balance for an address")
	fmt.Println("  printmempool            - Print all transactions in the mempool")
	fmt.Println("  printchain              - Print all blocks and transactions in the chain")
}

func MineBlock(b *Block) {
	prefix := ""
	for i := 0; i < difficulty; i++ {
		prefix += "0"
	}
	for {
		b.Hash = CalculateHash(*b)
		if b.Hash[:difficulty] == prefix {
			break
		}
		b.Nonce++
	}
}

func mining() {
	if len(Mempool) == 0 {
		// fmt.Println("No transactions to mine")
		// return
	}
	validTxs := []Transaction{}
	for _, tx := range Mempool {
		if VerifyTransaction(&tx) {
			validTxs = append(validTxs, tx)
		} else {
			fmt.Println("Skipping invalid transaction from", tx.Sender)
		}
	}
	lastBlock := Blockchain[len(Blockchain)-1]
	nextBlockIndex := lastBlock.Index + 1

	// --- Mining reward with halving like Bitcoin ---
	// Halving interval (e.g., every 210000 blocks)
	const halvingInterval = 150 //300000
	const initialReward = 50.0  // Initial block reward (BTC)
	halvings := nextBlockIndex / halvingInterval
	reward := initialReward / float64(uint64(1)<<uint(halvings))
	if reward < 0.00000001 {
		reward = 0 // No more block reward after enough halvings
	}

	// Set the miner address here (e.g., from command-line argument)
	minerAddress := ""
	for i := 2; i < len(os.Args)-1; i++ {
		if os.Args[i] == "-miner" && i+1 < len(os.Args) {
			minerAddress = os.Args[i+1]
			break
		}
	}
	if minerAddress == "" {
		fmt.Println("Usage: mine -miner MINER_ADDRESS")
		return
	}

	// Calculate total fees from valid transactions
	totalFees := 0.0
	for _, tx := range validTxs {
		totalFees += tx.Fee
	}
	// In Bitcoin, the coinbase transaction pays out the block reward (if any) plus all transaction fees
	coinbaseAmount := reward + totalFees
	// If both reward and fees are zero, skip mining (no incentive)
	if coinbaseAmount == 0 {
		fmt.Println("No reward or fees to mine, skipping block creation.")
		return
	}
	coinbaseTx := Transaction{
		Sender:    "",
		Recipient: minerAddress,
		Amount:    coinbaseAmount,
	}
	allTxs := append([]Transaction{coinbaseTx}, validTxs...)
	// ------------------------------------------------

	newBlock := Block{
		Index:        lastBlock.Index + 1,
		Timestamp:    time.Now().String(),
		Transactions: allTxs,
		PrevHash:     lastBlock.Hash,
		Nonce:        0,
	}
	MineBlock(&newBlock)
	Blockchain = append(Blockchain, newBlock)
	Mempool = []Transaction{}

	if !ChainIsValid(Blockchain) {
		panic("Blockchain data is invalid or has been tampered with!")
	}
	SaveBlockchain(Blockchain)
	SaveMempool(Mempool)
	fmt.Println("Mined block", newBlock.Index)
	fmt.Printf("Total award (block reward + fees): %.8f Coin\n", coinbaseAmount)

}
