package main

import (
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
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
	Node1          osmhelper.WsNode
	Node2          osmhelper.WsNode
	DistFromNode1  float32
	Updated        time.Time
	Speed          float64
	Node2PathIndex int
}

func SpawnCar(id int, spawnNode osmhelper.WsNode, despawnNode osmhelper.WsNode, helper *osmhelper.OsmHelper) (*Car, error) {
	pathIDs := findShortestPath(spawnNode, despawnNode, helper.WaysGraph, misc.IntArray{})

	path := make([]osmhelper.WsNode, len(pathIDs))

	for _, node := range helper.Nodes {
		if ok, i := pathIDs.Contains(int64(node.ID)); ok {
			path[i] = osmhelper.WsNode{
				ID:  int64(node.ID),
				Lat: node.Lat,
				Lon: node.Lon,
			}
		}
	}

	return &Car{
		ID:          id,
		SpawnNode:   spawnNode,
		DespawnNode: despawnNode,
		CurrentLoc: CarLoc{
			Node1:          path[0],
			Node2:          path[1],
			DistFromNode1:  0,
			Updated:        time.Now(),
			Speed:          14,
			Node2PathIndex: 1,
		},
		Path: path,
	}, nil
}

func findShortestPath(spawnNode osmhelper.WsNode, despawnNode osmhelper.WsNode, ways map[int64][]int64, path misc.IntArray) misc.IntArray {
	if _, exist := ways[spawnNode.ID]; !exist {
		return path
	}
	path = append(path, spawnNode.ID)
	if spawnNode.ID == despawnNode.ID {
		return path
	}
	shortest := make([]int64, 0)
	for _, node := range ways[spawnNode.ID] {
		if ok, _ := path.Contains(node); !ok {
			newPath := findShortestPath(spawnNode, despawnNode, ways, path)
			if len(newPath) > 0 {
				if len(shortest) == 0 || (len(newPath) < len(shortest)) {
					shortest = newPath
				}
			}
		}
	}
	return shortest
}

func (car Car) getCoords() (Lon float64, Lat float64) {
	r := float64(car.CurrentLoc.DistFromNode1*car.CurrentLoc.DistFromNode1) / osmhelper.WsCalcDist(car.CurrentLoc.Node1, car.CurrentLoc.Node2)

	Lon = car.CurrentLoc.Node1.Lon + r*(car.CurrentLoc.Node2.Lon-car.CurrentLoc.Node1.Lon)
	Lat = car.CurrentLoc.Node1.Lat + r*(car.CurrentLoc.Node2.Lat-car.CurrentLoc.Node1.Lat)
	return
}
