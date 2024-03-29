package osmhelper

import (
	"context"
	"fmt"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/paulmach/osm"
	"github.com/paulmach/osm/osmxml"
	"math"
	"os"
	"time"
)

type Way struct {
	Node1    *osm.Node
	Node2    *osm.Node
	Distance float64
	Tags     osm.Tags
}

type OsmHelper struct {
	Objects       osm.Objects
	Nodes         map[int64]*osm.Node
	Ways          []Way
	OsmWays       map[int64]*osm.Way
	TrafficLights osm.Nodes
	Bounds        *osm.Bounds
	WaysGraph     map[int64][]int64
}

type WsWay struct {
	Distance float64
	Node1    WsNode
	Node2    WsNode
	Tags     osm.Tags
}

type WsNode struct {
	ID  int64
	Lat float64
	Lon float64
}

type WsBoundRatio struct {
	X float64
	Y float64
}

const (
	onLineEps = 0.05
)

func NewOsmHelper(file string) (*OsmHelper, error) {
	defer misc.TimeTaken(time.Now(), "NewOsmHelper")
	objs, err := loadOSM(file)

	if err != nil {
		return nil, fmt.Errorf("osmhelper.go:32 cannot load objects: \n\t%v", err)
	}

	nodes := make(map[int64]*osm.Node)
	ways := make([]Way, 0)
	osmWays := make(map[int64]*osm.Way)
	trafficLights := make(osm.Nodes, 0)
	waysGraph := make(map[int64][]int64, 0)
	var bounds *osm.Bounds

	for _, obj := range objs {
		switch obj.ObjectID().Type() {
		case "node":
			node := obj.(*osm.Node)
			nodes[int64(node.ID)] = node
			if highwayTag, exists := node.TagMap()["highway"]; exists && highwayTag == "traffic_signals" {
				trafficLights = append(trafficLights, node)
			}
		case "way":
			var way *osm.Way = obj.(*osm.Way)
			osmWays[int64(way.ID)] = way

			// check if the way is a road
			// Since osm file assumes every line in the map as a way, we need to only get the roads
			if _, ok := way.TagMap()["highway"]; ok {
				firstFlag := true
				var firstNode *osm.Node
				for _, nodeID := range way.Nodes.NodeIDs() {

					// needed to build ways with two nodes
					if firstFlag {
						firstFlag = false
						firstNode = nodes[int64(nodeID)]
					} else {

						ways = append(ways, Way{
							Node1:    firstNode,
							Node2:    nodes[int64(nodeID)],
							Distance: calcDist(firstNode, nodes[int64(nodeID)]),
							Tags:     way.Tags,
						})

						if _, exists := waysGraph[int64(firstNode.ID)]; exists {
							waysGraph[int64(firstNode.ID)] = append(waysGraph[int64(firstNode.ID)], int64(nodes[int64(nodeID)].ID))
						} else {
							waysGraph[int64(firstNode.ID)] = []int64{int64(nodes[int64(nodeID)].ID)}
						}

						if _, exists := waysGraph[int64(nodes[int64(nodeID)].ID)]; exists {
							waysGraph[int64(nodes[int64(nodeID)].ID)] = append(waysGraph[int64(nodes[int64(nodeID)].ID)], int64(firstNode.ID))
						} else {
							waysGraph[int64(nodes[int64(nodeID)].ID)] = []int64{int64(nodes[int64(nodeID)].ID)}
						}

						firstNode = nodes[int64(nodeID)]

					}
				}
			}
		}

		switch obj.(type) {
		case *osm.Bounds:
			bounds = obj.(*osm.Bounds)
		}
	}

	misc.LogInfo("OsmHelper loaded %d Objects.\n\t%d Nodes\n\t%d Ways\n\t%d TrafficLights", len(objs), len(nodes), len(ways), len(trafficLights))

	return &OsmHelper{
		Objects:       objs,
		Nodes:         nodes,
		Ways:          ways,
		OsmWays:       osmWays,
		TrafficLights: trafficLights,
		Bounds:        bounds,
		WaysGraph:     waysGraph,
	}, nil
}

func (o OsmHelper) GetWsWays() []WsWay {
	wsWay := make([]WsWay, 0)
	for _, way := range o.Ways {
		if !isCarWay(way) {
			continue
		}
		wsWay = append(wsWay, WsWay{
			Distance: way.Distance,
			Node1: WsNode{
				ID:  int64(way.Node1.ID),
				Lat: way.Node1.Lat,
				Lon: way.Node1.Lon,
			},
			Node2: WsNode{
				ID:  int64(way.Node2.ID),
				Lat: way.Node2.Lat,
				Lon: way.Node2.Lon,
			},
			Tags: way.Tags,
		})
	}
	return wsWay
}

func (o OsmHelper) GetBounds() *osm.Bounds {
	return o.Bounds
}

func (o OsmHelper) GetBoundRatio() WsBoundRatio {
	return WsBoundRatio{
		X: distance(o.Bounds.MinLat, o.Bounds.MinLon, o.Bounds.MinLat, o.Bounds.MaxLon),
		Y: distance(o.Bounds.MinLat, o.Bounds.MinLon, o.Bounds.MaxLat, o.Bounds.MinLon),
	}
}

func (o OsmHelper) GetTrafficLights() []WsNode {
	wsNodes := make([]WsNode, 0)
	for _, trafficLight := range o.TrafficLights {
		wsNodes = append(wsNodes, WsNode{
			ID:  int64(trafficLight.ID),
			Lat: trafficLight.Lat,
			Lon: trafficLight.Lon,
		})
	}

	return wsNodes
}

func loadOSM(filePath string) (osm.Objects, error) {
	defer misc.TimeTaken(time.Now(), "loadOSM")

	var objs osm.Objects

	f, err := os.Open("./map.osm")

	if err != nil {
		return nil, fmt.Errorf("osmhelper.go:42 cannot open file: \n\t%v", err)
	}

	defer f.Close()

	scannerVar := osmxml.New(context.Background(), f)

	i := 0
	for scannerVar.Scan() {
		obj := scannerVar.Object()
		objs = append(objs, obj)
		i++
	}

	if err := scannerVar.Err(); err != nil {
		return nil, fmt.Errorf("osmhelper.go:57 scanner returned error: \n\t%v", err)
	}
	return objs, nil
}

func calcDist(aNode, bNode *osm.Node) float64 {
	return distance(aNode.Lat, aNode.Lon, bNode.Lat, bNode.Lon)
}

func WsCalcDist(aNode, bNode WsNode) float64 {
	return distance(aNode.Lat, aNode.Lon, bNode.Lat, bNode.Lon)
}

// Distance function returns the distance (in meters) between two points of
//     a given longitude and latitude relatively accurately (using a spherical
//     approximation of the Earth) through the Haversin Distance Formula for
//     great arc distance on a sphere with accuracy for small distances
//
// point coordinates are supplied in degrees and converted into rad. in the func
//
// distance returned is METERS!!!!!!
// http://en.wikipedia.org/wiki/Haversine_formula
func distance(lat1, lon1, lat2, lon2 float64) float64 {
	// convert to radians
	// must cast radius as float to multiply later
	var la1, lo1, la2, lo2, r float64
	la1 = lat1 * math.Pi / 180
	lo1 = lon1 * math.Pi / 180
	la2 = lat2 * math.Pi / 180
	lo2 = lon2 * math.Pi / 180

	r = 6378100 // Earth radius in METERS

	// calculate
	h := hsin(la2-la1) + math.Cos(la1)*math.Cos(la2)*hsin(lo2-lo1)

	return 2 * r * math.Asin(math.Sqrt(h))
}

// haversin(θ) function
func hsin(theta float64) float64 {
	return math.Pow(math.Sin(theta/2), 2)
}

func isCarWay(way Way) bool {
	highway := way.Tags.Find("highway")

	return highway == "motorway" || highway == "trunk" ||
		highway == "primary" || highway == "secondary" ||
		highway == "tertiary" || highway == "motorway_link" ||
		highway == "trunk_link" || highway == "primary_link" ||
		highway == "residential"
}

func (node WsNode) IsOnWay(way WsWay) bool {
	eps := (WsCalcDist(way.Node1, node) + WsCalcDist(node, way.Node2)) - way.Distance

	return eps <= onLineEps
}
