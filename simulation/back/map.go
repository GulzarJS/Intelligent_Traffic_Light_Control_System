package main

import (
	"fmt"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"time"
)

type Map struct {
	TrafficLightsGroups []TrafficLightsGroup
	Ways                []osmhelper.WsWay
	osmHelper           *osmhelper.OsmHelper
}

type TrafficLight struct {
	Node                 osmhelper.WsNode
	LastGreen            time.Time
	GreenDurationSeconds int
	RedDurationSeconds   int
	OnWay                osmhelper.WsWay
}

type TrafficLightsGroup struct {
	TrafficLights []TrafficLight
}

const (
	epsTrafficLightGroup = 5
)

func NewMap(osmHelper *osmhelper.OsmHelper) (*Map, error) {
	m := &Map{
		osmHelper:           osmHelper,
		TrafficLightsGroups: make([]TrafficLightsGroup, 0),
	}

	m.Ways = osmHelper.GetWsWays()

	trafficLights := osmHelper.GetTrafficLights()

	for _, wsTrafficLight := range trafficLights {

		var onWay osmhelper.WsWay
		onWaySet := false
		for _, way := range m.Ways {
			if wsTrafficLight.IsOnWay(way) {
				onWay = way
				onWaySet = true
				break
			}
		}

		if !onWaySet {
			return nil, fmt.Errorf("cannot find way for traffic light (%d)", wsTrafficLight.ID)
		}

		trafficLight := TrafficLight{
			Node:                 wsTrafficLight,
			LastGreen:            time.Now(),
			GreenDurationSeconds: 20,
			RedDurationSeconds:   20,
			OnWay:                onWay,
		}

		foundGroup := false
		for i, group := range m.TrafficLightsGroups {
			for _, light := range group.TrafficLights {
				if osmhelper.WsCalcDist(light.Node, wsTrafficLight) <= epsTrafficLightGroup {
					foundGroup = true
					m.TrafficLightsGroups[i].TrafficLights = append(m.TrafficLightsGroups[i].TrafficLights, trafficLight)
					break
				}
			}

			if foundGroup {
				break
			}
		}

		if !foundGroup {
			m.TrafficLightsGroups = append(m.TrafficLightsGroups, TrafficLightsGroup{TrafficLights: []TrafficLight{trafficLight}})
		}
	}

	return m, nil
}
