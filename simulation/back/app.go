package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/gorilla/websocket"
	"github.com/paulmach/osm"
	"net/http"
	"time"
)

type App struct {
	objs    osm.Objects
	cRouter *commandrouter.CommandRouter
	clnts   clients
}

var (
	upgrader = websocket.Upgrader{}
)

func NewApp(objs osm.Objects) *App {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	app := App{
		objs:    objs,
		cRouter: commandrouter.NewCommandRouter(),
		clnts: clients{
			clients: make(map[*websocket.Conn]bool),
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

	a.clnts.mux.Lock()
	defer a.clnts.mux.Unlock()
	a.clnts.clients[ws] = true
	go a.readMessages(ws)
}

func (a *App) readMessages(ws *websocket.Conn) {
	for {
		msgType, msg, err := ws.ReadMessage()
		if err != nil {
			a.clnts.mux.Lock()
			delete(a.clnts.clients, ws)
			a.clnts.mux.Unlock()
			misc.LogError(err, false, "app.go:62 ws.ReadMessage returned error")
			return
		}

		switch msgType {
		case websocket.CloseMessage:
			a.clnts.mux.Lock()
			delete(a.clnts.clients, ws)
			a.clnts.mux.Unlock()
			err := ws.Close()
			if !misc.LogError(err, false, "Cannot gracefully close ws connection") {
				misc.LogInfo("closed connection")
			}
			return
		case websocket.PingMessage:
			err := ws.WriteMessage(websocket.PongMessage, []byte{})
			misc.LogError(err, false, "Cannot write ws pong message")
			break
		case websocket.TextMessage:
			misc.LogInfo("Text Message received: %s", string(msg))
			err = a.cRouter.Match(string(msg), ws)
			misc.LogError(err, false, "Cannot route commands")
		}
	}
}
