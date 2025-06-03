package broadcast

import (
	"net"
	"time"
)

// ReconnectPeer tries to reconnect to a specific peer by address
func (bs *BroadcastService) reconnectPeer(oldPeer *Peer) error {
	conn, err := net.DialTimeout("tcp", oldPeer.address, 5*time.Second)
	if err != nil {
		return err
	}

	newPeer := &Peer{
		conn:       conn,
		address:    oldPeer.address,
		lastSeen:   time.Now(),
		disconnect: make(chan struct{}),
	}

	// Gantikan peer lama
	bs.peersLock.Lock()
	bs.peers[oldPeer.address] = newPeer
	bs.peersLock.Unlock()

	go bs.readFromPeer(newPeer)
	go bs.writeToPeer(newPeer)

	return nil
}
