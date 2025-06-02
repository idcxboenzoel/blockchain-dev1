package broadcast

import (
	"encoding/json"
	"io/ioutil"
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
	data, err := ioutil.ReadFile(ps.file)
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
	return ioutil.WriteFile(ps.file, data, 0644)
}
