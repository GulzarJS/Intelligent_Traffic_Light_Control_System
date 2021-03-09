package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
)

func (a *App) initializeRoutes() {
	a.cRouter.Add("/init", a.init)
	a.cRouter.Add("/getWays", a.getWays)
	a.cRouter.Add("/getBoundRatio", a.getBoundRatio)
	a.cRouter.Add("/getBounds", a.getBounds)
	a.cRouter.Add("/getTrafficLights", a.getTrafficLights)
}

type WsMessage struct {
	Type string
	Body interface{}
}

func (a *App) init(args commandrouter.RouteArgs) {
	err := args.Ws.WriteJSON(WsMessage{
		Type: "init",
		Body: "finished",
	})

	misc.LogError(err, false, "Write error occurred")
}

func (a *App) getWays(args commandrouter.RouteArgs) {
	misc.LogInfo("get ways called")
	err := args.Ws.WriteJSON(WsMessage{
		Type: "ways",
		Body: a.osmHelper.GetWsWays(),
	})

	misc.LogError(err, false, "Write error occurred")
}

func (a *App) getBoundRatio(args commandrouter.RouteArgs) {
	err := args.Ws.WriteJSON(WsMessage{
		Type: "boundratio",
		Body: a.osmHelper.GetBoundRatio(),
	})

	misc.LogError(err, false, "Write error occurred")
}

func (a *App) getBounds(args commandrouter.RouteArgs) {
	err := args.Ws.WriteJSON(WsMessage{
		Type: "bounds",
		Body: a.osmHelper.GetBounds(),
	})

	misc.LogError(err, false, "Write error occurred")
}

func (a *App) getTrafficLights(args commandrouter.RouteArgs) {
	err := args.Ws.WriteJSON(WsMessage{
		Type: "traffic_lights",
		Body: a.osmHelper.GetTrafficLights(),
	})

	misc.LogError(err, false, "Write error occurred")
}
