package broadcast

import (
	"blockchain-dev1/types"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"sync"
	"time"
)

type Handler interface {
	HandleTransaction(tx *types.Transaction)
	HandleBlock(block types.Block)
}

const (
	maxMessageSize = 10 * 1024 * 1024 // 10MB
	writeTimeout   = 5 * time.Second
	readTimeout    = 30 * time.Second
	peerLimit      = 100
)

type Peer struct {
	conn       net.Conn
	address    string
	lastSeen   time.Time
	disconnect chan struct{}
	once       sync.Once
}

type BroadcastService struct {
	peers     map[string]*Peer
	peersLock sync.RWMutex
	incoming  chan types.Message
	wg        sync.WaitGroup
	shutdown  chan struct{}
	handler   Handler
	peerStore *PeerStore
}

func NewBroadcastService(handler Handler) *BroadcastService {
	return &BroadcastService{
		handler:   handler,
		peers:     make(map[string]*Peer),
		incoming:  make(chan types.Message, 100),
		shutdown:  make(chan struct{}),
		peerStore: NewPeerStore("peers.json"),
	}
}

func (bs *BroadcastService) ConnectToAllPeers() {
	addresses := bs.peerStore.List()
	for _, addr := range addresses {
		go bs.ConnectToPeer(addr)
	}
}

func (bs *BroadcastService) Start(port string) error {
	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		return fmt.Errorf("failed to start listener: %w", err)
	}

	go bs.acceptConnections(listener)
	go bs.processIncomingMessages()
	go bs.monitorPeerHealth()

	return nil
}

func (bs *BroadcastService) acceptConnections(listener net.Listener) {
	defer listener.Close()

	for {
		select {
		case <-bs.shutdown:
			return
		default:
			conn, err := listener.Accept()
			if err != nil {
				if !errors.Is(err, net.ErrClosed) {
					fmt.Printf("Accept error: %v\n", err)
				}
				continue
			}

			bs.wg.Add(1)
			go bs.handleNewConnection(conn)
		}
	}
}

func (bs *BroadcastService) handleNewConnection(conn net.Conn) {
	defer bs.wg.Done()

	peer := &Peer{
		conn:       conn,
		address:    conn.RemoteAddr().String(),
		lastSeen:   time.Now(),
		disconnect: make(chan struct{}),
	}

	bs.peersLock.Lock()
	if len(bs.peers) >= peerLimit {
		bs.peersLock.Unlock()
		conn.Close()
		fmt.Printf("Rejected peer %s (peer limit reached)\n", peer.address)
		return
	}
	bs.peers[peer.address] = peer
	bs.peersLock.Unlock()

	fmt.Printf("New peer connected: %s\n", peer.address)

	go bs.readFromPeer(peer)
	go bs.writeToPeer(peer)

	<-peer.disconnect
	bs.removePeer(peer)
}

func (bs *BroadcastService) readFromPeer(peer *Peer) {
	defer bs.disconnectPeer(peer)

	decoder := json.NewDecoder(peer.conn)

	for {
		select {
		case <-peer.disconnect:
			return
		default:
			peer.conn.SetReadDeadline(time.Now().Add(readTimeout))

			var msg types.Message
			if err := decoder.Decode(&msg); err != nil {
				if errors.Is(err, io.EOF) || errors.Is(err, net.ErrClosed) {
					fmt.Printf("Peer %s disconnected\n", peer.address)
				} else {
					fmt.Printf("Read error from %s: %v\n", peer.address, err)
				}
				return
			}

			// Optional: cek ukuran msg.Data di sini jika diperlukan

			fmt.Printf("Received message from %s: %s\n", peer.address, msg.Type)
			peer.lastSeen = time.Now()
			bs.incoming <- msg
		}
	}
}

func (bs *BroadcastService) writeToPeer(peer *Peer) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-peer.disconnect:
			return
		case <-ticker.C:
			ping := types.Message{Type: "ping"}
			if err := bs.sendMessageToPeer(peer, ping); err != nil {
				fmt.Printf("Ping failed to %s: %v\n", peer.address, err)
				bs.disconnectPeer(peer)
				return
			}
		}
	}
}

func (bs *BroadcastService) disconnectPeer(peer *Peer) {
	peer.once.Do(func() {
		close(peer.disconnect)
	})
}

func (bs *BroadcastService) processIncomingMessages() {
	for {
		select {
		case <-bs.shutdown:
			return
		case msg := <-bs.incoming:
			switch msg.Type {
			case "new_transaction":
				var txMsg types.TxMessage
				if err := json.Unmarshal(msg.Data, &txMsg); err == nil {
					bs.handler.HandleTransaction(&txMsg.Tx)
					fmt.Printf("Processing message type: %s\n", msg.Type)
				} else {
					fmt.Printf("Invalid transaction message data: %v\n", err)
				}
			case "new_block":
				var blkMsg types.BlockMessage
				if err := json.Unmarshal(msg.Data, &blkMsg); err == nil {
					if len(blkMsg.Blocks) > 0 {
						bs.handler.HandleBlock(blkMsg.Blocks[0])
						fmt.Printf("Processing message type: %s\n", msg.Type)
					} else {
						fmt.Println("Block message contains no blocks")
					}
				} else {
					fmt.Printf("Invalid block message data: %v\n", err)
				}
			case "getaddr":
				addrMsg := types.AddrMessage{Addresses: bs.peerStore.List()}
				data, _ := json.Marshal(addrMsg)
				response := types.Message{Type: "addr", Data: data}
				bs.BroadcastMessage(response)

			case "addr":
				var msgList types.AddrMessage
				if err := json.Unmarshal(msg.Data, &msgList); err == nil {
					for _, addr := range msgList.Addresses {
						if addr != "" {
							bs.peerStore.Add(addr)
						}
					}
				}
			case "ping":
				// ignore
			default:
				fmt.Printf("Unknown message type: %s\n", msg.Type)
			}

			bs.BroadcastMessage(msg)
		}
	}

}

func (bs *BroadcastService) monitorPeerHealth() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-bs.shutdown:
			return
		case <-ticker.C:
			bs.checkPeerConnections()
		}
	}
}

func (bs *BroadcastService) checkPeerConnections() {
	bs.peersLock.RLock()
	defer bs.peersLock.RUnlock()

	for _, peer := range bs.peers {
		if time.Since(peer.lastSeen) > 2*time.Minute {
			fmt.Printf("Disconnecting inactive peer: %s\n", peer.address)
			bs.disconnectPeer(peer)
		}
	}
}

func (bs *BroadcastService) BroadcastMessage(msg types.Message) error {
	bs.peersLock.RLock()
	defer bs.peersLock.RUnlock()

	var wg sync.WaitGroup
	var firstError error
	var errorLock sync.Mutex

	for _, peer := range bs.peers {
		wg.Add(1)
		go func(p *Peer) {
			defer wg.Done()
			if err := bs.sendMessageToPeer(p, msg); err != nil {
				errorLock.Lock()
				if firstError == nil {
					firstError = fmt.Errorf("failed to send to %s: %w", p.address, err)
				}
				errorLock.Unlock()
			}
		}(peer)
	}

	fmt.Printf("Broadcasting to %d peers\n", len(bs.peers))

	wg.Wait()
	return firstError
}

func (bs *BroadcastService) sendMessageToPeer(peer *Peer, msg types.Message) error {
	peer.conn.SetWriteDeadline(time.Now().Add(writeTimeout))
	fmt.Printf("Sending message to %s\n", peer.address)
	return json.NewEncoder(peer.conn).Encode(msg)
}

func (bs *BroadcastService) removePeer(peer *Peer) {
	bs.peersLock.Lock()
	defer bs.peersLock.Unlock()
	delete(bs.peers, peer.address)
	peer.conn.Close()
}

func (bs *BroadcastService) Stop() {
	close(bs.shutdown)

	bs.peersLock.RLock()
	for _, peer := range bs.peers {
		bs.disconnectPeer(peer)
	}
	bs.peersLock.RUnlock()

	bs.wg.Wait()
	close(bs.incoming)
}

// ConnectToPeer connects to a peer at the given address.
// You should implement the actual connection logic as needed.
func (bs *BroadcastService) ConnectToPeer(address string) error {
	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		log.Printf("Failed to connect to %s: %v", address, err)
		return err
	}

	bs.wg.Add(1)
	go bs.handleNewConnection(conn)

	// Tambahkan ke peerStore
	bs.peerStore.Add(address)

	// Kirim getaddr
	msg := types.Message{Type: "getaddr"}
	_ = json.NewEncoder(conn).Encode(msg)

	return nil
}
