package main

import (
	"fmt"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"sync"
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
	CenterNode    osmhelper.WsNode
	Mux           sync.Mutex `json:"-"`
}

const (
	epsTrafficLightGroup = 5
)

func NewMap(osmHelper *osmhelper.OsmHelper) (*Map, error) {
	defer misc.TimeTaken(time.Now(), "NewMap")
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

		for k, trafficLightsGroup := range m.TrafficLightsGroups {
			var nearestNode osmhelper.WsNode

			nearestNode = trafficLightsGroup.TrafficLights[0].OnWay.Node2
			if osmhelper.WsCalcDist(trafficLightsGroup.TrafficLights[0].Node, trafficLightsGroup.TrafficLights[0].OnWay.Node1) <
				osmhelper.WsCalcDist(trafficLightsGroup.TrafficLights[0].Node, trafficLightsGroup.TrafficLights[0].OnWay.Node2) {
				nearestNode = trafficLightsGroup.TrafficLights[0].OnWay.Node1
			}

			m.TrafficLightsGroups[k].CenterNode = nearestNode
		}
	}

	return m, nil
}

func (m *Map) GetTrafficGroups() []TrafficLightsGroup {
	return m.TrafficLightsGroups
}
