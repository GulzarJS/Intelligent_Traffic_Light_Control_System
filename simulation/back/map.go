package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"time"
)

type Map struct {
	TrafficLightsGroups []TrafficLightsGroup
	Ways                []osmhelper.WsWay
}

type TrafficLight struct {
	Node                 osmhelper.WsNode
	LastGreen            time.Time
	GreenDurationSeconds int
	RedDurationSeconds   int
}

type TrafficLightsGroup struct {
	TrafficLight []TrafficLight
}

func NewMap(osmHelper osmhelper.OsmHelper) (*Map, error) {
	return &Map{}, nil
}
