package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/wshelper"
)

func (a *App) initializeRoutes() {
	a.cRouter.Add("/init", a.init)
	a.cRouter.Add("/getWays", a.getWays)
	a.cRouter.Add("/getBoundRatio", a.getBoundRatio)
	a.cRouter.Add("/getBounds", a.getBounds)
	a.cRouter.Add("/getTrafficLightsGroups", a.getTrafficLightsGroups)
}

type WsMessage struct {
	Type string
	Body interface{}
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

func (a *App) getMap(conn *wshelper.WsConn) *Map {
	return a.clientMaps[conn.Id]
}
