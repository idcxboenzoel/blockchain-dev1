// network/manager.go
package network

import (
	// "blockchain-dev1/blockchain" // Removed to avoid import cycle
	"blockchain-dev1/blockchain"
	"blockchain-dev1/broadcast"
	"blockchain-dev1/types"
	"log"
)

type TransactionHandler interface {
	AddTransactionToMempool(tx types.Transaction)
	AddBlockIfValid(block types.Block)
}

// NetworkManager manages network operations and delegates transaction/block handling.
type NetworkManager struct {
	handler          TransactionHandler
	broadcastService *broadcast.BroadcastService
}

func NewNetworkManager(handler TransactionHandler) *NetworkManager {
	nm := &NetworkManager{handler: handler}
	nm.broadcastService = broadcast.NewBroadcastService(nm)

	if err := nm.broadcastService.Start("8080"); err != nil {
		log.Fatalf("Failed to start network: %v", err)
	}

	return nm
}

func (nm *NetworkManager) Start() {
	nm.connectToBootstrapPeers()
}

func (nm *NetworkManager) connectToBootstrapPeers() {
	bootstrapPeers := []string{"localhost:8081", "localhost:8082"} // Example bootstrap peers
	for _, peer := range bootstrapPeers {
		if err := nm.broadcastService.ConnectToPeer(peer); err != nil {
			log.Printf("Failed to connect to bootstrap peer %s: %v", peer, err)
		} else {
			log.Printf("Connected to bootstrap peer: %s", peer)
		}
	}
}

func (nm *NetworkManager) HandleTransaction(tx *types.Transaction) {
	log.Printf("Received transaction from network: %+v\n", tx)
	if nm.handler != nil {
		nm.handler.AddTransactionToMempool(*tx)
	}
}

func (nm *NetworkManager) HandleBlock(block types.Block) {
	log.Printf("Received block from network: %+v\n", block)
	blockchain.AddBlockIfValid(block)
}

func (nm *NetworkManager) Stop() {
	nm.broadcastService.Stop()
}
