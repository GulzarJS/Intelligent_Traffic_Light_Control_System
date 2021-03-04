package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
)

func (a *App) initializeRoutes() {
	a.cRouter.Add("/init", a.init)
	a.cRouter.Add("/getWays", a.getWays)
	a.cRouter.Add("/getBoundRatio", a.getBoundRatio)
}

type WsMessage struct {
	Type string
	Body interface{}
}

func (a *App) init(args commandrouter.RouteArgs) {
	//nodes := make(osm.Nodes, 0)
	//
	//for _, obj := range a.osmHelper.Objects {
	//	switch obj.ObjectID().Type() {
	//	case "node":
	//		nodes = append(nodes, obj.(*osm.Node))
	//	}
	//}
	//err := args.Ws.WriteJSON(WsMessage{
	//	Type: "nodes",
	//	Body: nodes,
	//})
	//misc.LogError(err, false, "Write error occurred")

	err := args.Ws.WriteJSON(WsMessage{
		Type: "init",
		Body: "finished",
	})

	misc.LogError(err, false, "Write error occurred")
}

func (a *App) getWays(args commandrouter.RouteArgs) {
	misc.LogInfo("get ways called")
	err := args.Ws.WriteJSON(WsMessage{
		Type: "nodes",
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
