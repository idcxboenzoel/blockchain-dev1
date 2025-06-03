package main

import (
	"blockchain-dev1/blockchain"
	"blockchain-dev1/broadcast"
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

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

const (
	apiKeyHeader   = "X-API-Key"
	requiredAPIKey = "your-secure-api-key" // Change to your secret key, store safely
	listenAddr     = "0.0.0.0"
	certFile       = "server.crt" // TLS certificate
	keyFile        = "server.key" // TLS private key
)

var (
	miningMu sync.Mutex
)

const difficulty = 4 // Number of leading zeros required

// NodeHandler implements the broadcast.Handler interface
type NodeHandler struct{}

func (h *NodeHandler) HandleTransactions(tx []types.Transaction) {
	for _, t := range tx {
		blockchain.AddTransactionToMempool(t)
	}
}

func (h *NodeHandler) HandleBlocks(block []types.Block) {
	success := blockchain.ReplaceChainIfValid(block)
	if !success {
		fmt.Println("Failed to sync chain from peer")
	}
}

func (h *NodeHandler) HandleTransaction(tx *types.Transaction) {
	blockchain.AddTransactionToMempool(*tx)
}

func (h *NodeHandler) HandleBlock(block types.Block) {
	success := blockchain.HandleNewBlock(block, blockchain.Blockchain)
	if !success {
		fmt.Println("Failed to sync chain from peer")
	}
}

func (h *NodeHandler) GetAllBlocks() []types.Block {
	blocks := []types.Block{}
	blocks = append(blocks, blockchain.Blockchain...)
	return blocks
}

func (h *NodeHandler) GetAllTransactions() []types.Transaction {
	txs := []types.Transaction{}
	txs = append(txs, blockchain.Mempool...)
	return txs

}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

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

	bs, err := initBroadcast()
	if err != nil {
		log.Fatal("Failed to initialize broadcast service:", err)
	}
	// Register API routes with middleware for API key authentication
	routes(mux, bs)
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

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "9292"
	}

	server := &http.Server{
		Addr:         listenAddr + ":" + port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 20 * time.Second,
	}
	log.Printf("Starting blockchain server on http://%s\n", listenAddr+":"+port)
	err = server.ListenAndServe()
	if err != nil {
		log.Fatal("Server failed:", err)
	}

	// log.Printf("Starting secure blockchain server on http://%s\n", listenAddr)
	// err = server.ListenAndServeTLS(certFile, keyFile)
	// if err != nil {
	// 	log.Fatal("Server failed:", err)
	// }
}

func initBroadcast() (*broadcast.BroadcastService, error) {
	handler := &NodeHandler{}
	bs := broadcast.NewBroadcastService(handler)

	port := os.Getenv("BROADCAST_PORT")
	if port == "" {
		port = "9999"
	}
	go func() {
		if err := bs.Start(port); err != nil {
			fmt.Printf("Broadcast service error: %v\n", err)
		}
		fmt.Printf("Broadcast service started on port %s\n", port)

		// bs.LoadPeers() // Load existing peers from file using exported method
		// Connect to all known peers
		retryCount := 0
		for {
			done := make(chan struct{})
			var beforeBlockLen, beforeTxLen int
			if handler != nil {
				beforeBlockLen = len(handler.GetAllBlocks())
				beforeTxLen = len(handler.GetAllTransactions())
			}
			go func() {
				bs.BootstrapFromPeers()
				close(done)
			}()
			select {
			case <-done:
				// Bootstrapping finished
				fmt.Println("Bootstrap from peers completed")
			case <-time.After(1 * time.Minute):
				fmt.Println("Bootstrap from peers timed out after 1 minute")
			}

			afterBlockLen, afterTxLen := beforeBlockLen, beforeTxLen
			if handler != nil {
				afterBlockLen = len(handler.GetAllBlocks())
				afterTxLen = len(handler.GetAllTransactions())
			}
			if afterBlockLen == beforeBlockLen && afterTxLen == beforeTxLen {
				retryCount++
				fmt.Printf("No new blocks or transactions from peers, sleeping 1 minute before next bootstrap... (retry %d/5)\n", retryCount)
				if retryCount >= 5 {
					fmt.Println("No response after 5 retries, stopping bootstrap attempts.")
					break
				}
				time.Sleep(20 * time.Second)
			} else {
				retryCount = 0 // reset on success
			}
			// Loop continues, will bootstrap again unless 5 retries reached
		}
	}()
	// bs.ConnectToAllPeers()

	return bs, nil
}

// Middleware to check API key in header for every request
func ApiKeyAuth(next func(http.ResponseWriter, *http.Request, *broadcast.BroadcastService), broadcastService *broadcast.BroadcastService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get(apiKeyHeader)
		if key != requiredAPIKey {
			http.Error(w, "Forbidden: invalid API key", http.StatusForbidden)
			return
		}
		next(w, r, broadcastService)
	}
}

func HandleCreateWallet(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
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

func HandleAddTx(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
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

		txMsg := struct {
			Tx types.Transaction `json:"tx"`
		}{
			Tx: tx,
		}
		txMsgBytes, err := json.Marshal(txMsg)
		if err != nil {
			writeJSON(w, map[string]string{"error": "Failed to marshal transaction message: " + err.Error()})
			return
		}
		msg := types.Message{
			Type: "new_transactions",
			Data: json.RawMessage(txMsgBytes),
		}

		broadcastService.BroadcastMessage(msg)

		writeJSON(w, map[string]string{"status": "Transaction added to mempool"})
	} else {
		writeJSON(w, map[string]string{"error": "Invalid transaction signature"})
	}
}

// Handle mining asynchronously so server is not blocked
func HandleMineAsync(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
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

		// get all block and transaction form all peers before mining
		log.Println("Starting mining process for miner:", miner)

		broadcastService.BootstrapFromPeers()
		mining(miner, broadcastService)

	}(req.MinerAddress)

	writeJSON(w, map[string]string{"status": "Mining started asynchronously"})
}

func HandleGetListAllBlocks(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
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

func HandleGetBlockByIndex(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
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

func HandlerGetWallet(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
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
func mining(minerAddress string, broadcastService *broadcast.BroadcastService) {
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

	blockMsg := types.BlockMessage{
		Blocks: []types.Block{newBlock},
	}
	blockMsgBytes, err := json.Marshal(blockMsg)
	if err != nil {
		log.Println("Failed to marshal block message:", err)
		return
	}

	msg := types.Message{
		Type: "new_blocks",
		Data: json.RawMessage(blockMsgBytes),
	}

	broadcastService.BroadcastMessage(msg)

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

func HandleBalance(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
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

func HandlePrintChain(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
	writeJSON(w, blockchain.Blockchain)
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func HandlePrintMempool(w http.ResponseWriter, r *http.Request, broadcastService *broadcast.BroadcastService) {
	w.Header().Set("Content-Type", "application/json")
	if len(blockchain.Mempool) == 0 {
		w.Write([]byte("[]"))
		return
	}
	json.NewEncoder(w).Encode(blockchain.Mempool)
}
