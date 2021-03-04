package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/paulmach/osm"
)

func (a *App) initializeRoutes() {
	a.cRouter.Add("/init", a.test)
	a.cRouter.Add("^received$", a.received)
}

type WsMessage struct {
	Type string
}

type TestStruct struct {
	Message string
	Body    interface{}
}

func (a *App) test(args commandrouter.RouteArgs) {
	nodes := make(osm.Nodes, 0)

	for _, obj := range a.objs {
		switch obj.ObjectID().Type() {
		case "node":
			nodes = append(nodes, obj.(*osm.Node))
		}
	}
	err := args.Ws.WriteJSON(TestStruct{
		Message: "nodes",
		Body:    nodes,
	})
	misc.LogError(err, false, "Write error occurred")
}

func (a *App) received(args commandrouter.RouteArgs) {
	misc.LogInfo("received")
}
