package wshelper

import (
	"github.com/gorilla/websocket"
	"sync"
)

type Clients struct {
	Clients   map[int]*WsConn
	ClientIds map[*websocket.Conn]int
	Mux       sync.Mutex
	NextId    int
}

type WsConn struct {
	Id  int
	Ws  *websocket.Conn
	Mux sync.Mutex
}

func (ws *WsConn) WriteJSON(message interface{}) error {
	ws.Mux.Lock()
	defer ws.Mux.Unlock()

	return ws.Ws.WriteJSON(message)
}
