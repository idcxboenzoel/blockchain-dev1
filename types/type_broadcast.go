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
