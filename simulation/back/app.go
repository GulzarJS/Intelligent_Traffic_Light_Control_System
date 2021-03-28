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
	cRouter    *commandrouter.CommandRouter
	clients    wshelper.Clients
	osmHelper  *osmhelper.OsmHelper
	clientMaps map[int]*Map
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
		clients: wshelper.Clients{
			Clients:   make(map[int]*wshelper.WsConn),
			ClientIds: make(map[*websocket.Conn]int),
			NextId:    0,
		},
		clientMaps: make(map[int]*Map),
	}

	app.initializeRoutes()

	return &app
}

func (a *App) serveWs(w http.ResponseWriter, r *http.Request) {
	defer misc.TimeTaken(time.Now(), "serveWs")
	misc.LogInfo("serveWs called by %s", r.Host)
	ws, err := upgrader.Upgrade(w, r, nil)

	if misc.LogError(err, false, "error while upgrading request to ws") {
		return
	}

	a.clients.Mux.Lock()
	defer a.clients.Mux.Unlock()
	wsConn := &wshelper.WsConn{
		Id:  a.clients.NextId,
		Ws:  ws,
		Mux: sync.Mutex{},
	}
	a.clients.Clients[a.clients.NextId] = wsConn
	a.clients.ClientIds[ws] = a.clients.NextId
	a.clients.NextId = a.clients.NextId + 1
	go a.readMessages(wsConn)
}

func (a *App) readMessages(ws *wshelper.WsConn) {
	for {
		msgType, msg, err := ws.Ws.ReadMessage()
		if err != nil {
			a.clients.Mux.Lock()
			delete(a.clients.ClientIds, ws.Ws)
			delete(a.clients.Clients, ws.Id)
			a.clients.Mux.Unlock()
			misc.LogError(err, false, "")
			return
		}

		switch msgType {
		case websocket.CloseMessage:
			a.clients.Mux.Lock()
			delete(a.clients.ClientIds, ws.Ws)
			delete(a.clients.Clients, ws.Id)
			a.clients.Mux.Unlock()
			err := ws.Ws.Close()
			if !misc.LogError(err, false, "cannot gracefully close ws connection") {
				misc.LogInfo("closed connection")
			}
			return
		case websocket.PingMessage:
			ws.Mux.Lock()
			err := ws.Ws.WriteMessage(websocket.PongMessage, []byte{})
			ws.Mux.Unlock()
			misc.LogError(err, false, "cannot write ws pong message")
			break
		case websocket.TextMessage:
			misc.LogInfo("Text Message received: %s", string(msg))
			err = a.cRouter.Match(string(msg), ws)
			misc.LogError(err, false, "cannot route commands")
		}
	}
}

func (a *App) sendCarsLocation(m *Map, ws *wshelper.WsConn) {
	ticker := time.NewTicker(125 * time.Millisecond)

	for _ = range ticker.C {
		m.CalculateCars()
		cars := []WsCar{}

		for _, car := range m.Cars {

			lon, lat := car.getCoords()

			cars = append(cars, WsCar{
				ID:  car.ID,
				Lon: lon,
				Lat: lat,
			})
		}

		ws.WriteJSON(WsMessage{
			Type: "cars",
			Body: cars,
		})
	}
}
