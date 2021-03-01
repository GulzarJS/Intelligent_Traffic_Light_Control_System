package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/commandrouter"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
)

type testStruct struct {
	message string
}

func test(args commandrouter.RouteArgs) {
	err := args.Ws.WriteJSON(testStruct{message: "test"})
	misc.LogError(err, false, "Write error occurred")
}
