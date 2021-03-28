package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/wshelper"
	"strconv"
	"strings"
)

func (a *App) initializeRoutes() {
	a.cRouter.Add("/init", a.init)
	a.cRouter.Add("/getWays", a.getWays)
	a.cRouter.Add("/getBoundRatio", a.getBoundRatio)
	a.cRouter.Add("/getBounds", a.getBounds)
	a.cRouter.Add("/getTrafficLightsGroups", a.getTrafficLightsGroups)
	a.cRouter.Add(`/spawnCars/(?P<spawns>[\w|_|#|\-|\d]+)/(?P<despawns>[\w|_|#|\-|\d]+)`, a.spawnCars)
}

type WsMessage struct {
	Type string
	Body interface{}
}

type WsCar struct {
	ID  int
	Lon float64
	Lat float64
}

func (a *App) init(args commandrouter.RouteArgs) {
	m, err := NewMap(a.osmHelper)

	status := "finished"

	if err != nil {
		misc.LogError(err, false, "")
		status = "error"
	}

	a.clientMaps[args.Ws.Id] = m

	err = args.Ws.WriteJSON(WsMessage{
		Type: "init",
		Body: status,
	})

	misc.LogError(err, false, "write error occurred")
}

func (a *App) getWays(args commandrouter.RouteArgs) {
	misc.LogInfo("get ways called")
	err := args.Ws.WriteJSON(WsMessage{
		Type: "ways",
		Body: a.osmHelper.GetWsWays(),
	})

	misc.LogError(err, false, "write error occurred")
}

func (a *App) getBoundRatio(args commandrouter.RouteArgs) {
	err := args.Ws.WriteJSON(WsMessage{
		Type: "boundratio",
		Body: a.osmHelper.GetBoundRatio(),
	})

	misc.LogError(err, false, "write error occurred")
}

func (a *App) getBounds(args commandrouter.RouteArgs) {
	err := args.Ws.WriteJSON(WsMessage{
		Type: "bounds",
		Body: a.osmHelper.GetBounds(),
	})

	misc.LogError(err, false, "write error occurred")
}

func (a *App) getTrafficLightsGroups(args commandrouter.RouteArgs) {
	m := a.getMap(args.Ws)

	err := args.Ws.WriteJSON(WsMessage{
		Type: "traffic_lights_groups",
		Body: m.GetTrafficGroups(),
	})

	misc.LogError(err, false, "write error occurred")
}

func (a *App) spawnCars(args commandrouter.RouteArgs) {

	spawnPointsStr := strings.Split(args.Params["spawns"], ",")
	spawnPointIDs := misc.IntArray{}
	for _, s := range spawnPointsStr {
		tmp, err := strconv.Atoi(s)
		if misc.LogError(err, false, "cannot parse spawn point ID") {
			return
		}
		spawnPointIDs = append(spawnPointIDs, int64(tmp))
	}

	despawnPointsStr := strings.Split(args.Params["despawns"], ",")
	despawnPointIDs := misc.IntArray{}
	for _, s := range despawnPointsStr {
		tmp, err := strconv.Atoi(s)
		if misc.LogError(err, false, "cannot parse spawn point ID") {
			return
		}
		despawnPointIDs = append(despawnPointIDs, int64(tmp))
	}

	spawnPoints := make([]osmhelper.WsNode, len(spawnPointIDs))
	despawnPoints := make([]osmhelper.WsNode, len(despawnPointIDs))

	var spawnPointI int
	var despawnPointI int
	for _, node := range a.osmHelper.Nodes {
		if ok, _ := spawnPointIDs.Contains(int64(node.ID)); ok {
			spawnPoints[spawnPointI] = osmhelper.WsNode{
				ID:  int64(node.ID),
				Lat: node.Lat,
				Lon: node.Lon,
			}
			spawnPointI++
			continue
		}

		if ok, _ := despawnPointIDs.Contains(int64(node.ID)); ok {
			despawnPoints[despawnPointI] = osmhelper.WsNode{
				ID:  int64(node.ID),
				Lat: node.Lat,
				Lon: node.Lon,
			}
			despawnPointI++
		}
	}

	m := a.getMap(args.Ws)

	err := m.InitializeCars(spawnPoints, despawnPoints)

	if misc.LogError(err, false, "") {
		return
	}

	go a.sendCarsLocation(m, args.Ws)
}

func (a *App) getMap(conn *wshelper.WsConn) *Map {
	return a.clientMaps[conn.Id]
}
