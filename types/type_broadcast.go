package types

import (
	"encoding/json"
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
	Blocks []Block `json:"Blocks"`
}

type TxMessage struct {
	Tx Transaction `json:"Tx"`
}

type Message struct {
	Type string          `json:"Type"`
	Data json.RawMessage `json:"Data"`
}
