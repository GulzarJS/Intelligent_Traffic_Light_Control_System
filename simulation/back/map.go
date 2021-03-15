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
	Mux           sync.Mutex `json:"-"`
}

const (
	epsTrafficLightGroup = 50
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

		// Find the way the traffic light is on

		var onWay1 osmhelper.WsWay
		var onWay2 osmhelper.WsWay
		onWaySet := 0
		for _, way := range m.Ways {
			if wsTrafficLight.IsOnWay(way) {
				onWaySet++
				if onWaySet == 1 {
					onWay1 = way
				} else if onWaySet == 2 {
					onWay2 = way
				} else {
					break
				}
			}
		}

		onWay := onWay2

		if onWay1.Distance < onWay2.Distance {
			onWay = onWay1
		}

		trafficLight := TrafficLight{
			Node:                 wsTrafficLight,
			LastGreen:            time.Now(),
			GreenDurationSeconds: 20,
			RedDurationSeconds:   20,
			OnWay:                onWay,
		}

		// Fill the TrafficLightsGroups

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

	for i, group := range m.TrafficLightsGroups {
		firstRefLight := group.TrafficLights[0]

		for j := 1; j < len(group.TrafficLights); j++ {
			if firstRefLight.OnWay.Tags.Find("name") != group.TrafficLights[j].OnWay.Tags.Find("name") {
				dur, _ := time.ParseDuration(fmt.Sprintf("%-ds", group.TrafficLights[j].GreenDurationSeconds))
				m.TrafficLightsGroups[i].TrafficLights[j].LastGreen = group.TrafficLights[j].LastGreen.Add(dur)
			}
		}
	}

	return m, nil
}

func (m *Map) GetTrafficGroups() []TrafficLightsGroup {
	return m.TrafficLightsGroups
}
