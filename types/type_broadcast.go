package types

import (
	"net"
	"sync"
)

type Node struct {
	peers        map[string]net.Conn
	mempool      Transaction
	blockchain   []Block
	peersMutex   sync.RWMutex
	type_message string
}

type BlockMessage struct {
	Type   string
	Blocks []Block
}

type TxMessage struct {
	Type string
	Tx   *Transaction
}

type Message struct {
	Type string `json:"type"`
	Data any    `json:"data"`
	// Data BlockMessage
	// Add other fields as needed for your protocol
}
