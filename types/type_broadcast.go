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

type AddrMessage struct {
	Addresses []string `json:"addresses"`
}

type GetBlocksMessage struct{}
type GetTransactionsMessage struct{}

type AllBlocksMessage struct {
	Blocks []Block `json:"blocks"`
}

type AllTransactionsMessage struct {
	Transactions []Transaction `json:"transactions"`
}
