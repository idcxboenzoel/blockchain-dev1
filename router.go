package main

import (
	"blockchain-dev1/broadcast"
	"net/http"
)

func routes(mux *http.ServeMux, broadcastService *broadcast.BroadcastService) {
	mux.HandleFunc("/createwallet", ApiKeyAuth(HandleCreateWallet, broadcastService))
	mux.HandleFunc("/addtx", ApiKeyAuth(HandleAddTx, broadcastService))
	mux.HandleFunc("/mine", ApiKeyAuth(HandleMineAsync, broadcastService))
	mux.HandleFunc("/balance", ApiKeyAuth(HandleBalance, broadcastService))
	mux.HandleFunc("/printchain", ApiKeyAuth(HandlePrintChain, broadcastService))
	mux.HandleFunc("/printmempool", ApiKeyAuth(HandlePrintMempool, broadcastService))

	mux.HandleFunc("/blocks", ApiKeyAuth(HandleGetListAllBlocks, broadcastService))
	// mux.HandleFunc("/block", ApiKeyAuth(HandleGetBlockByHash))
	mux.HandleFunc("/block/index", ApiKeyAuth(HandleGetBlockByIndex, broadcastService))

	mux.HandleFunc("/wallet", ApiKeyAuth(HandlerGetWallet, broadcastService))
}
