package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"github.com/paulmach/osm"
	"time"
)

type Car struct {
	ID          int
	SpawnNode   osmhelper.WsNode
	DespawnNode osmhelper.WsNode
	CurrentLoc  CarLoc
	Path        []osmhelper.WsWay
}

type CarLoc struct {
	Node1         osmhelper.WsNode
	Node2         osmhelper.WsNode
	DistFromNode1 float32
	Updated       time.Time
	Speed         float64
}

func SpawnCar(id int, spawnNode osmhelper.WsNode, despawnNode osmhelper.WsNode, ways []osmhelper.WsWay) (*Car, error) {

}

func findShortestPath(spawnNode osmhelper.WsNode, despawnNode osmhelper.WsNode, ways []osmhelper.WsWay) ([]osmhelper.WsWay, error) {

}
