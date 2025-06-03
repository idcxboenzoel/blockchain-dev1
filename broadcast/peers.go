package broadcast

import (
	"encoding/json"
	"os"
	"sync"
)

type PeerStore struct {
	mu    sync.Mutex
	Peers map[string]bool
	file  string
}

func NewPeerStore(filename string) *PeerStore {
	ps := &PeerStore{
		Peers: make(map[string]bool),
		file:  filename,
	}
	ps.Load()
	return ps
}

func (ps *PeerStore) Add(address string) {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	ps.Peers[address] = true
	ps.Save()
}

func (ps *PeerStore) List() []string {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	var list []string
	for addr := range ps.Peers {
		list = append(list, addr)
	}
	return list
}

func (ps *PeerStore) Load() error {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	data, err := os.ReadFile(ps.file)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	return json.Unmarshal(data, &ps.Peers)
}

func (ps *PeerStore) Save() error {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	data, err := json.MarshalIndent(ps.Peers, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(ps.file, data, 0644)
}

func (ps *PeerStore) Remove(address string) {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	delete(ps.Peers, address)
	ps.Save()
}

func (ps *PeerStore) Clear() {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	ps.Peers = make(map[string]bool)
	ps.Save()
}

func (ps *PeerStore) Exists(address string) bool {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	_, exists := ps.Peers[address]
	return exists
}

func (ps *PeerStore) Count() int {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	return len(ps.Peers)
}

func (ps *PeerStore) Close() error {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	return ps.Save()
}
