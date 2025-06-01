package main

import (
	"net/http"
)

func routes(mux *http.ServeMux) {
	mux.HandleFunc("/createwallet", ApiKeyAuth(HandleCreateWallet))
	mux.HandleFunc("/addtx", ApiKeyAuth(HandleAddTx))
	mux.HandleFunc("/mine", ApiKeyAuth(HandleMineAsync))
	mux.HandleFunc("/balance", ApiKeyAuth(HandleBalance))
	mux.HandleFunc("/printchain", ApiKeyAuth(HandlePrintChain))
	mux.HandleFunc("/printmempool", ApiKeyAuth(HandlePrintMempool))

	mux.HandleFunc("/blocks", ApiKeyAuth(HandleGetListAllBlocks))
	// mux.HandleFunc("/block", ApiKeyAuth(HandleGetBlockByHash))
	mux.HandleFunc("/block/index", ApiKeyAuth(HandleGetBlockByIndex))

	mux.HandleFunc("/wallet", ApiKeyAuth(HandlerGetWallet))
}
