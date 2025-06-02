package broadcast

import (
	"blockchain-dev1/types"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"sync"
	"time"
)

const (
	maxMessageSize = 10 * 1024 * 1024 // 10MB
	writeTimeout   = 5 * time.Second
	readTimeout    = 30 * time.Second
)

var (
	peers     = make(map[string]net.Conn) // Track peers by remote address
	peersLock sync.RWMutex
)

type Peer struct {
	conn       net.Conn
	address    string
	disconnect chan struct{}
}

// BroadcastMessage sends a message to all connected peers
func BroadcastMessage(msg interface{}) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	peersLock.RLock()
	defer peersLock.RUnlock()

	var wg sync.WaitGroup
	var firstError error
	var errorLock sync.Mutex

	for addr, conn := range peers {
		wg.Add(1)
		go func(addr string, conn net.Conn) {
			defer wg.Done()
			if err := sendToPeer(conn, data); err != nil {
				errorLock.Lock()
				if firstError == nil {
					firstError = fmt.Errorf("failed to send to %s: %w", addr, err)
				}
				errorLock.Unlock()
			}
		}(addr, conn)
	}

	wg.Wait()
	return firstError
}

func sendToPeer(conn net.Conn, data []byte) error {
	conn.SetWriteDeadline(time.Now().Add(writeTimeout))
	_, err := conn.Write(append(data, '\n'))
	return err
}

// BroadcastNewTransaction broadcasts a new transaction to the network
func BroadcastNewTransaction(tx types.Transaction) error {
	msg := types.TxMessage{
		Type: "new_transaction",
		Tx:   &tx,
	}
	return BroadcastMessage(msg)
}

// BroadcastNewBlock broadcasts a new block to the network
func BroadcastNewBlock(block types.Block) error {
	msg := types.BlockMessage{
		Type:   "new_block",
		Blocks: []types.Block{block},
	}
	return BroadcastMessage(msg)
}

// AddPeer adds a new peer connection
func AddPeer(conn net.Conn) *Peer {
	peer := &Peer{
		conn:       conn,
		address:    conn.RemoteAddr().String(),
		disconnect: make(chan struct{}),
	}

	peersLock.Lock()
	peers[peer.address] = conn
	peersLock.Unlock()

	fmt.Printf("New peer connected: %s\n", peer.address)
	return peer
}

// RemovePeer removes a peer connection
func RemovePeer(peer *Peer) {
	peersLock.Lock()
	delete(peers, peer.address)
	peersLock.Unlock()
	close(peer.disconnect)
	fmt.Printf("Peer disconnected: %s\n", peer.address)
}

// ListenToPeer handles incoming messages from a peer
func ListenToPeer(peer *Peer) {
	defer peer.conn.Close()

	decoder := json.NewDecoder(peer.conn)
	for {
		peer.conn.SetReadDeadline(time.Now().Add(readTimeout))

		var rawMsg json.RawMessage
		if err := decoder.Decode(&rawMsg); err != nil {
			if errors.Is(err, net.ErrClosed) || errors.Is(err, io.EOF) {
				fmt.Printf("Peer %s disconnected\n", peer.address)
			} else {
				fmt.Printf("Error reading from %s: %v\n", peer.address, err)
			}
			break
		}

		if len(rawMsg) > maxMessageSize {
			fmt.Printf("Message too large from %s\n", peer.address)
			continue
		}

		go handleRawMessage(rawMsg, peer.address)
	}

	RemovePeer(peer)
}

func handleRawMessage(rawMsg json.RawMessage, peerAddr string) {
	var baseMsg struct {
		Type string `json:"Type"`
	}
	if err := json.Unmarshal(rawMsg, &baseMsg); err != nil {
		fmt.Printf("Failed to decode message type from %s: %v\n", peerAddr, err)
		return
	}

	switch baseMsg.Type {
	case "new_transaction":
		var msg types.TxMessage
		if err := json.Unmarshal(rawMsg, &msg); err != nil {
			fmt.Printf("Failed to decode TxMessage from %s: %v\n", peerAddr, err)
			return
		}
		handleTransactionMessage(&msg)
	case "new_block":
		var msg types.BlockMessage
		if err := json.Unmarshal(rawMsg, &msg); err != nil {
			fmt.Printf("Failed to decode BlockMessage from %s: %v\n", peerAddr, err)
			return
		}
		handleBlockMessage(&msg)
	default:
		fmt.Printf("Unknown message type '%s' from %s\n", baseMsg.Type, peerAddr)
	}
}

func handleTransactionMessage(msg *types.TxMessage) {
	if msg.Tx == nil {
		fmt.Println("Received TxMessage with nil Tx")
		return
	}

	fmt.Println("Received new transaction:", *msg.Tx)

}

func handleBlockMessage(msg *types.BlockMessage) {
	if len(msg.Blocks) == 0 {
		fmt.Println("Received BlockMessage with no blocks")
		return
	}

	block := msg.Blocks[0]
	fmt.Println("Received new block:", block)

}

// StartBroadcastServer starts the P2P server
func StartBroadcastServer(port string) error {
	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		return fmt.Errorf("failed to start broadcast server: %w", err)
	}
	defer listener.Close()

	fmt.Println("Broadcast server started on port", port)

	for {
		conn, err := listener.Accept()
		if err != nil {
			if !errors.Is(err, net.ErrClosed) {
				fmt.Println("Failed to accept connection:", err)
			}
			continue
		}

		peer := AddPeer(conn)
		go ListenToPeer(peer)
	}
}

// ConnectToPeer establishes a connection to another peer
func ConnectToPeer(address string) error {
	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to peer %s: %w", address, err)
	}

	peer := AddPeer(conn)
	go ListenToPeer(peer)
	return nil
}
