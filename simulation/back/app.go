package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/wshelper"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
	"time"
)

type App struct {
	cRouter   *commandrouter.CommandRouter
	clnts     wshelper.Clients
	osmHelper *osmhelper.OsmHelper
}

var (
	upgrader = websocket.Upgrader{}
)

func NewApp(osmHelper *osmhelper.OsmHelper) *App {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	app := App{
		osmHelper: osmHelper,
		cRouter:   commandrouter.NewCommandRouter(),
		clnts: wshelper.Clients{
			Clients:   make(map[int]*wshelper.WsConn),
			ClientIds: make(map[*websocket.Conn]int),
			NextId:    0,
		},
	}

	app.initializeRoutes()

	return &app
}

func (a *App) serveWs(w http.ResponseWriter, r *http.Request) {
	defer misc.TimeTaken(time.Now(), "serveWs")
	misc.LogInfo("serveWs called by %s", r.Host)
	ws, err := upgrader.Upgrade(w, r, nil)

	if misc.LogError(err, false, "Error while upgrading request to ws") {
		return
	}

	a.clnts.Mux.Lock()
	defer a.clnts.Mux.Unlock()
	wsConn := &wshelper.WsConn{
		Id:  a.clnts.NextId,
		Ws:  ws,
		Mux: sync.Mutex{},
	}
	a.clnts.Clients[a.clnts.NextId] = wsConn
	a.clnts.ClientIds[ws] = a.clnts.NextId
	a.clnts.NextId = a.clnts.NextId + 1
	go a.readMessages(wsConn)
}

func (a *App) readMessages(ws *wshelper.WsConn) {
	for {
		msgType, msg, err := ws.Ws.ReadMessage()
		if err != nil {
			a.clnts.Mux.Lock()
			delete(a.clnts.ClientIds, ws.Ws)
			delete(a.clnts.Clients, ws.Id)
			a.clnts.Mux.Unlock()
			misc.LogError(err, false, "app.go:62 ws.ReadMessage returned error")
			return
		}

		switch msgType {
		case websocket.CloseMessage:
			a.clnts.Mux.Lock()
			delete(a.clnts.ClientIds, ws.Ws)
			delete(a.clnts.Clients, ws.Id)
			a.clnts.Mux.Unlock()
			err := ws.Ws.Close()
			if !misc.LogError(err, false, "Cannot gracefully close ws connection") {
				misc.LogInfo("closed connection")
			}
			return
		case websocket.PingMessage:
			ws.Mux.Lock()
			err := ws.Ws.WriteMessage(websocket.PongMessage, []byte{})
			ws.Mux.Unlock()
			misc.LogError(err, false, "Cannot write ws pong message")
			break
		case websocket.TextMessage:
			misc.LogInfo("Text Message received: %s", string(msg))
			err = a.cRouter.Match(string(msg), ws)
			misc.LogError(err, false, "Cannot route commands")
		}
	}
}
