package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"github.com/paulmach/osm"
	"time"
)

type Car struct {
	ID          int
	SpawnNode   osmhelper.WsNode
	DespawnNode osmhelper.WsNode
	CurrentLoc  CarLoc
	Path        []osmhelper.WsNode
}

type CarLoc struct {
	Node1         osmhelper.WsNode
	Node2         osmhelper.WsNode
	DistFromNode1 float32
	Updated       time.Time
	Speed         float64
}

func SpawnCar(id int, spawnNode osmhelper.WsNode, despawnNode osmhelper.WsNode, ways []osmhelper.WsWay) (*Car, error) {
	path, err := findShortestPath(spawnNode, despawnNode, ways)

	if err != nil {
		return nil, err
	}

	return &Car{
		ID:          id,
		SpawnNode:   spawnNode,
		DespawnNode: despawnNode,
		CurrentLoc: CarLoc{
			Node1:         path[0],
			Node2:         path[1],
			DistFromNode1: 0,
			Updated:       time.Now(),
			Speed:         60,
		},
		Path: path,
	}, nil
}

func findShortestPath(spawnNode osmhelper.WsNode, despawnNode osmhelper.WsNode, ways []osmhelper.WsWay) ([]osmhelper.WsNode, error) {

}
