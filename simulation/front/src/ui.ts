import Konva from 'konva'
import Stage from 'konva'
import {Layer} from 'konva/types/Layer';
import {Circle} from 'konva/types/shapes/Circle';
import App, {WsBounds, WsMessageWay, WsTrafficLight, WsTrafficLightsGroups} from "./app";
import WsCommander from "./wscommander";
import {TrafficLightUILayer} from "./trafficlightuilayer";
import {CarsUILayer} from "./carsuilayer";
import {CarsSpawnLayer} from "./carsspawnlayer";

export class AppUI {
    public stage: Stage.Stage
    public mapLayer: Stage.Layer

    private trafficLightUILayer: TrafficLightUILayer
    private carsUILayer: CarsUILayer
    private carsSpawnLayer: CarsSpawnLayer

    private wsCommander: WsCommander
    private bounds: WsBounds
    readonly mapContainerId = "map-container"
    private lastClickedWay: WsMessageWay
    private app: App
    private wedgeWayDict: IWedgeWay[]
    public lastClickedTrafficLight: WsTrafficLight

    constructor(wsCommander: WsCommander, app: App) {
        this.wsCommander = wsCommander
        this.stage = new Konva.Stage({
            container: this.mapContainerId,
            width: document.getElementById(this.mapContainerId).scrollWidth,
            height: document.getElementById(this.mapContainerId).scrollHeight
        })

        this.mapLayer = new Konva.Layer()

        this.trafficLightUILayer = new TrafficLightUILayer(this)
        this.carsUILayer = new CarsUILayer(this)
        this.carsSpawnLayer = new CarsSpawnLayer(this)


        this.stage.add(this.mapLayer)


        app.boundsListener.attach((bounds: WsBounds) => {
            this.bounds = bounds
            wsCommander.getWays()
            wsCommander.getTrafficLightsGroups()
        })
        app.waysListener.attach((this.drawWays).bind(this))

        app.trafficLightsGroupsListener.attach((this.drawTrafficLights).bind(this))
    }

    drawWays(ways: WsMessageWay[]) {
        let lines: Konva.Line[] = []
        for (const way of ways) {
            //TODO: Draw lines
            let aPoint = this.pointTransformer(new Point(way.Node1.Lon, way.Node1.Lat))
            let bPoint = this.pointTransformer(new Point(way.Node2.Lon, way.Node2.Lat))

            let line = new Konva.Line({
                points: [aPoint.Lon, aPoint.Lat, bPoint.Lon, bPoint.Lat],
                stroke: 'black',
                strokeWidth: 2
            })

            lines.push(line)

            this.mapLayer.add(line)

            line.draw()

            line.addEventListener("click", (e: Event) => {
                this.lastClickedWay = way
                this.carsUILayer.showLayer()
                this.carsUILayer.drawLayer()
                this.stage.draw()
            })
        }

        this.mapLayer.batchDraw()
    }

    drawTrafficLights(trafficLightsGroups: WsTrafficLightsGroups[]) {
        for (const trafficLightsGroup of trafficLightsGroups) {
            let circleCoords = this.findTrafficLightsGroupCenter(trafficLightsGroup)
            let nodeCircle = new Konva.Circle({
                x: circleCoords.Lon,
                y: circleCoords.Lat,
                radius: 50,
                stroke: 'purple',
                strokeWidth: 2,
            })


            this.mapLayer.add(nodeCircle)


            nodeCircle.draw()


            for (const node of trafficLightsGroup.TrafficLights) {
                let coords = this.pointTransformer(node.Node)

                let diffSeconds = (new Date()).getTime() - (new Date(node.LastGreen)).getTime() / 1000
                // if (diffSeconds > 3)
                //     console.log(diffSeconds)
                diffSeconds = diffSeconds % (node.RedDurationSeconds + node.RedDurationSeconds)
                let fill = ''
                let duration = 0

                if (diffSeconds > 0 && diffSeconds < node.GreenDurationSeconds) {
                    fill = 'green'
                    duration = node.GreenDurationSeconds - diffSeconds
                } else {
                    fill = 'red'
                    duration = node.RedDurationSeconds - (diffSeconds - node.GreenDurationSeconds)
                }

                let circle = new Konva.Circle({
                    x: coords.Lon,
                    y: coords.Lat,
                    radius: 6,
                    fill: fill
                })

                nodeCircle.on('click', () => {

                    this.trafficLightUILayer.showLayer()

                    this.stage.draw()
                })

                setTimeout(() => {
                    this.toggleTrafficLightFill(circle, node, this.mapLayer)
                }, duration * 1000)

                this.mapLayer.add(circle)

                circle.draw()
            }
        }

        this.mapLayer.batchDraw()
    }


    pointTransformer(p: Point): Point {
        let ret = new Point(p.Lon, p.Lat)

        ret.Lon -= this.bounds.MinLon
        ret.Lat -= this.bounds.MinLat

        ret.Lon *= document.getElementById(this.mapContainerId).scrollWidth / (this.bounds.MaxLon - this.bounds.MinLon)
        ret.Lat *= document.getElementById(this.mapContainerId).scrollHeight / (this.bounds.MaxLat - this.bounds.MinLat)

        ret.Lat = document.getElementById(this.mapContainerId).scrollHeight - ret.Lat

        return ret
    }


    findTrafficLightsGroupCenter(t: WsTrafficLightsGroups): Point {
        let p = new Point(0, 0)

        for (let trafficLight of t.TrafficLights) {
            p.Lon += trafficLight.Node.Lon
            p.Lat += trafficLight.Node.Lat
        }

        p.Lon = p.Lon / t.TrafficLights.length
        p.Lat = p.Lat / t.TrafficLights.length

        return this.pointTransformer(p)
    }

    toggleTrafficLightFill(circle: Circle, t: WsTrafficLight, l: Layer) {
        let duration = t.RedDurationSeconds * 1000
        if (circle.fill() == 'red') {
            circle.fill('green')
            duration = t.GreenDurationSeconds * 1000
        } else
            circle.fill('red')
        l.batchDraw()
        setTimeout(() => this.toggleTrafficLightFill(circle, t, l), duration)
    }




    spawnCar() {
        let wedgeCoords = this.pointTransformer(this.lastClickedWay.Node1)
        let wedge = new Konva.Wedge({
            x: wedgeCoords.Lon,
            y: wedgeCoords.Lat,
            radius: 40,
            angle: 40,
            fill: 'green',
            rotation: -120
        })

        wedge.addEventListener('click', (e) => {
            for (const wedgeWay of this.wedgeWayDict) {
                if (wedgeWay.wedge == wedge) {
                    removeItemOnce(this.app.spawnPoints, wedgeWay.way)
                    break
                }
            }
            wedge.remove()
            this.carsSpawnLayer.drawLayer()
        })

        // TODO: Add backend spawn point sending or store it somewhere for sending all by batch
        // TODO: Add a play button or smth when there is at least one spawner AND one despawner
        // TODO: Don't let two (de)spawners overlap each other

        this.wedgeWayDict.push({wedge: wedge, way: this.lastClickedWay})
        this.app.spawnPoints.push(this.lastClickedWay)
        this.carsSpawnLayer.getlayer().add(wedge)
        this.carsSpawnLayer.drawLayer()
    }

    despawnCar() {
        let wedgeCoords = this.pointTransformer(this.lastClickedWay.Node1)
        let wedge = new Konva.Wedge({
            x: wedgeCoords.Lon,
            y: wedgeCoords.Lat,
            radius: 40,
            angle: 40,
            fill: 'red',
            rotation: -120
        })

        wedge.addEventListener('click', (e) => {
            wedge.remove()
            this.carsSpawnLayer.drawLayer()
        })

        // TODO: Add backend spawn point sending or store it somewhere for sending all by batch
        // TODO: Add a play button or smth when there is at least one spawner AND one despawner
        // TODO: Don't let two (de)spawners overlap each other

        this.carsSpawnLayer.getlayer().add(wedge)
        this.carsSpawnLayer.drawLayer()
    }
}


class Point {
    Lon: number
    Lat: number

    constructor(lon: number, lat: number) {
        this.Lat = lat
        this.Lon = lon
    }
}

interface IWedgeWay {
    wedge: Konva.Wedge
    way: WsMessageWay
}

function removeItemOnce<Type>(arr: Type[], value: Type) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}