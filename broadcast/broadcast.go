package broadcast

import (
	"blockchain-dev1/types"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"sync"
	"time"
)

type Handler interface {
	HandleTransactions(tx []types.Transaction)
	HandleBlocks(block []types.Block)
	HandleTransaction(tx *types.Transaction)
	HandleBlock(block types.Block)
	GetAllBlocks() []types.Block
	GetAllTransactions() []types.Transaction
}

const (
	maxMessageSize = 10 * 1024 * 1024
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
	sendLock   sync.Mutex
}

type BroadcastService struct {
	peers     map[string]*Peer
	peersLock sync.RWMutex
	incoming  chan incomingMessage
	wg        sync.WaitGroup
	shutdown  chan struct{}
	handler   Handler
	peerStore *PeerStore
}

type incomingMessage struct {
	Peer *Peer
	Msg  types.Message
}

func NewBroadcastService(handler Handler) *BroadcastService {
	return &BroadcastService{
		handler:   handler,
		peers:     make(map[string]*Peer),
		incoming:  make(chan incomingMessage, 100),
		shutdown:  make(chan struct{}),
		peerStore: NewPeerStore("data/peers.json"),
	}
}

func (bs *BroadcastService) Start(port string) error {
	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		return fmt.Errorf("failed to start listener: %w", err)
	}

	go bs.ConnectToAllPeers()
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
					log.Printf("Accept error: %v\n", err)
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

	address := conn.RemoteAddr().String()
	peer := &Peer{
		conn:       conn,
		address:    address,
		lastSeen:   time.Now(),
		disconnect: make(chan struct{}),
	}

	bs.peersLock.Lock()
	if len(bs.peers) >= peerLimit {
		bs.peersLock.Unlock()
		conn.Close()
		log.Printf("Rejected peer %s (peer limit reached)\n", address)
		return
	}
	bs.peers[address] = peer
	bs.peersLock.Unlock()

	log.Printf("New peer connected: %s (local: %s)\n", address, conn.LocalAddr().String())

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
					log.Printf("Peer %s disconnected\n", peer.address)
				} else {
					log.Printf("Read error from %s: %v\n", peer.address, err)
				}
				return
			}

			peer.lastSeen = time.Now()
			bs.incoming <- incomingMessage{Peer: peer, Msg: msg}
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
				log.Printf("Ping failed to %s: %v\n", peer.address, err)
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
		case in := <-bs.incoming:
			fmt.Printf("Received message from %s: Type=%s, Data=%s\n", in.Peer.address, in.Msg.Type, string(in.Msg.Data))
			switch in.Msg.Type {
			case "new_blocks":
				var msg types.AllBlocksMessage
				if err := json.Unmarshal(in.Msg.Data, &msg); err != nil {
					fmt.Println("Invalid blocks data:", err)
					continue
				}
				bs.handler.HandleBlocks(msg.Blocks)

			case "new_transactions":
				var txMsg types.AllTransactionsMessage
				if err := json.Unmarshal(in.Msg.Data, &txMsg); err != nil {
					fmt.Println("Invalid transactions data:", err)
					continue
				}
				bs.handler.HandleTransactions(txMsg.Transactions)
			case "get_blocks":
				blocks := bs.handler.GetAllBlocks()
				data, _ := json.Marshal(types.AllBlocksMessage{Blocks: blocks})
				resp := types.Message{Type: "all_blocks", Data: data}
				_ = bs.sendMessageToPeer(in.Peer, resp)

			case "get_transactions":
				txs := bs.handler.GetAllTransactions()
				data, _ := json.Marshal(types.AllTransactionsMessage{Transactions: txs})
				resp := types.Message{Type: "all_transactions", Data: data}
				_ = bs.sendMessageToPeer(in.Peer, resp)

			case "all_blocks":
				var blkMsg types.AllBlocksMessage
				if err := json.Unmarshal(in.Msg.Data, &blkMsg); err == nil {
					for _, block := range blkMsg.Blocks {
						bs.handler.HandleBlock(block)
					}
				}

			case "all_transactions":
				var txMsg types.AllTransactionsMessage
				if err := json.Unmarshal(in.Msg.Data, &txMsg); err == nil {
					for _, tx := range txMsg.Transactions {
						bs.handler.HandleTransaction(&tx)
					}
				}
			case "getaddr":
				addrMsg := types.AddrMessage{Addresses: bs.peerStore.List()}
				data, _ := json.Marshal(addrMsg)
				resp := types.Message{Type: "addr", Data: data}
				_ = bs.sendMessageToPeer(in.Peer, resp)
			case "addr":
				var msgList types.AddrMessage
				if err := json.Unmarshal(in.Msg.Data, &msgList); err == nil {
					for _, addr := range msgList.Addresses {
						if addr != "" && addr != in.Peer.address {
							bs.peerStore.Add(addr)
						}
					}
				}
			case "ping":
				pong := types.Message{Type: "pong"}
				_ = bs.sendMessageToPeer(in.Peer, pong)
			case "pong":
				in.Peer.lastSeen = time.Now()
			default:
				log.Printf("Unknown message type: %s\n", in.Msg.Type)
			}
		}
	}
}

func (bs *BroadcastService) BroadcastMessage(msg types.Message) error {
	bs.peersLock.RLock()
	defer bs.peersLock.RUnlock()

	var wg sync.WaitGroup
	var firstError error
	var errLock sync.Mutex

	for _, peer := range bs.peers {
		wg.Add(1)
		go func(p *Peer) {
			defer wg.Done()
			if err := bs.sendMessageToPeer(p, msg); err != nil {
				errLock.Lock()
				if firstError == nil {
					firstError = fmt.Errorf("send to %s failed: %w", p.address, err)
				}
				errLock.Unlock()
			}
		}(peer)
	}

	wg.Wait()
	return firstError
}

func (bs *BroadcastService) sendMessageToPeer(peer *Peer, msg types.Message) error {
	peer.sendLock.Lock()
	defer peer.sendLock.Unlock()

	peer.conn.SetWriteDeadline(time.Now().Add(writeTimeout))
	err := json.NewEncoder(peer.conn).Encode(msg)
	if err != nil {
		log.Printf("Send failed to %s: %v, trying reconnect...\n", peer.address, err)

		// Coba reconnect
		if reconnectErr := bs.reconnectPeer(peer); reconnectErr != nil {
			log.Printf("Reconnect to %s failed: %v\n", peer.address, reconnectErr)
			bs.disconnectPeer(peer)
			return err
		}

		// Retry kirim pesan setelah reconnect
		log.Printf("Reconnected to %s. Retrying message...\n", peer.address)
		return json.NewEncoder(peer.conn).Encode(msg)
	}

	return nil
}

func (bs *BroadcastService) monitorPeerHealth() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-bs.shutdown:
			return
		case <-ticker.C:
			bs.peersLock.RLock()
			for _, peer := range bs.peers {
				if time.Since(peer.lastSeen) > 2*time.Minute {
					log.Printf("Disconnecting inactive peer: %s\n", peer.address)
					bs.disconnectPeer(peer)
				}
			}
			bs.peersLock.RUnlock()
		}
	}
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

func (bs *BroadcastService) ConnectToPeer(address string) error {
	bs.peersLock.RLock()
	if _, exists := bs.peers[address]; exists {
		bs.peersLock.RUnlock()
		return nil // Sudah terkoneksi
	}
	bs.peersLock.RUnlock()

	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		log.Printf("Failed to connect to %s: %v", address, err)
		return err
	}

	bs.wg.Add(1)
	go bs.handleNewConnection(conn)

	bs.peerStore.Add(address)

	msg := types.Message{Type: "getaddr"}
	_ = json.NewEncoder(conn).Encode(msg)

	return nil
}

func (bs *BroadcastService) ConnectToAllPeers() error {
	print("connection to peers... ")
	fmt.Println()

	peers := bs.peerStore.List()
	if len(peers) == 0 {
		return fmt.Errorf("no peers to connect to")
	}

	print("..........................\n")

	var firstError error
	var errLock sync.Mutex

	for _, address := range peers {
		if err := bs.ConnectToPeer(address); err != nil {
			errLock.Lock()
			if firstError == nil {
				firstError = fmt.Errorf("failed to connect to peer %s: %w", address, err)
			}
			errLock.Unlock()

		}
	}

	print("Connected to peers: ")
	for _, address := range peers {
		fmt.Printf("%s ", address)
	}
	fmt.Println()

	return firstError
}

func isFirstRun() bool {
	_, err := os.Stat("first_run.flag")
	return os.IsNotExist(err)
}

func markFirstRunDone() {
	_ = os.WriteFile("first_run.flag", []byte("done"), 0644)
}

func (bs *BroadcastService) BootstrapFromPeers() {
	bs.peersLock.RLock()
	defer bs.peersLock.RUnlock()

	if len(bs.peers) == 0 {
		log.Println("No peers to bootstrap from.")
		return
	}

	log.Println("Bootstrapping from peers...")

	for _, peer := range bs.peers {
		getBlocks := types.Message{Type: "get_blocks"}
		getTxs := types.Message{Type: "get_transactions"}
		_ = bs.sendMessageToPeer(peer, getBlocks)
		_ = bs.sendMessageToPeer(peer, getTxs)
		// break // hanya ambil dari satu peer
	}
}

func (bs *BroadcastService) ListPeers() []string {
	bs.peersLock.RLock()
	defer bs.peersLock.RUnlock()

	var addresses []string
	for addr := range bs.peers {
		addresses = append(addresses, addr)
	}
	return addresses
}
