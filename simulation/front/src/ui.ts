import Konva from 'konva'
import Stage from 'konva'
import {Layer} from 'konva/types/Layer';
import {Circle} from 'konva/types/shapes/Circle';
import App, {WsBounds, WsMessageWay, WsTrafficLight, WsTrafficLightsGroups} from "./app";
import WsCommander from "./wscommander";
import {SubLayers} from "./sublayers";

export class AppUI {
    public stage: Stage.Stage
    public mapLayer: Stage.Layer
    private carsUILayer: Stage.Layer
    private carsSpawnLayer: Stage.Layer
    private sublayers: SubLayers
    // private trafficLightsUILayer: Stage.Layer
    private wsCommander: WsCommander
    private bounds: WsBounds
    readonly mapContainerId = "map-container"
    private lastClickedWay: WsMessageWay

    constructor(wsCommander: WsCommander, app: App) {
        this.wsCommander = wsCommander
        this.stage = new Konva.Stage({
            container: this.mapContainerId,
            width: document.getElementById(this.mapContainerId).scrollWidth,
            height: document.getElementById(this.mapContainerId).scrollHeight
        })

        this.sublayers = new  SubLayers(this.stage)
        this.mapLayer = new Konva.Layer()
        // this.trafficLightsUILayer = this.sublayers.trafficLightsUILayer
        this.carsUILayer = new Konva.Layer()
        this.carsSpawnLayer = new Konva.Layer()

        this.carsUILayer.hide()

        this.setUpCarsUILayer()

        this.stage.add(this.mapLayer)
        this.stage.add(this.carsUILayer)
        this.stage.add(this.carsSpawnLayer)


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
                this.carsUILayer.show()
                this.carsUILayer.draw()
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
                // this.trafficLightsUILayer.setGreenLightDuration(48)
                // this.trafficLightsUILayer.setRedLightDuration(52)
                this.sublayers.trafficLightsUILayer.show()
                // this.trafficLightsUILayer.drawLayer()
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

    setUpCarsUILayer() {
        let border = new Konva.Rect({
            x: 5,
            y: 280,
            width: 400,
            height: 250,
            fill: 'gray',
            stroke: 'gray',
            strokeWidth: 4,
            draggable: true,
            shadowColor: 'gray',
            shadowBlur: 10,
            // shadowOffset: 10,
            shadowOpacity: 0.5
        })

        this.carsUILayer.add(border)
        let spawner = this.sublayers.createButtons('Set as car spawner', 20, 300);
        let despawner = this.sublayers.createButtons('Set as car despawner', 20, 350);
        let exit = this.sublayers.createButtons('Exit', 20, 450);

        this.carsUILayer.add(spawner, despawner, exit)

        exit.on('click', () => {
            this.carsUILayer.hide()
        })

        spawner.on('click', () => {
            this.spawnCar()
        })

        despawner.on('click', (event) => {
            this.despawnCar()
        })

        this.carsUILayer.draw()
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
            wedge.remove()
            this.carsSpawnLayer.draw()
        })

        // TODO: Add backend spawn point sending or store it somewhere for sending all by batch
        // TODO: Add a play button or smth when there is at least one spawner AND one despawner
        // TODO: Don't let two (de)spawners overlap each other

        this.carsSpawnLayer.add(wedge)
        this.carsSpawnLayer.draw()
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
            this.carsSpawnLayer.draw()
        })

        // TODO: Add backend spawn point sending or store it somewhere for sending all by batch
        // TODO: Add a play button or smth when there is at least one spawner AND one despawner
        // TODO: Don't let two (de)spawners overlap each other

        this.carsSpawnLayer.add(wedge)
        this.carsSpawnLayer.draw()
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