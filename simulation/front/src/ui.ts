import Konva from 'konva'
import Stage from 'konva'
import App, {WsBounds, WsMessageNode, WsMessageWay} from "./app";
import WsCommander from "./wscommander";

export class AppUI {
    public stage: Stage.Stage
    public mapLayer: Stage.Layer
    private wsCommander: WsCommander
    private bounds: WsBounds
    readonly mapContainerId = "map-container"

    constructor(wsCommander: WsCommander, app: App) {
        this.wsCommander = wsCommander
        this.stage = new Konva.Stage({
            container: 'map-container',
            width: document.getElementById(this.mapContainerId).scrollWidth,
            height: document.getElementById(this.mapContainerId).scrollHeight
        })

        this.mapLayer = new Konva.Layer()

        this.stage.add(this.mapLayer)

        app.boundsListener.attach((bounds: WsBounds) => {
            this.bounds = bounds
            wsCommander.getWays()
            wsCommander.getTrafficLights()
        })
        app.waysListener.attach((this.drawWays).bind(this))
        app.trafficLightsListener.attach((this.drawTrafficLights).bind(this))
    }

    drawWays(ways: WsMessageWay[]){
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
                console.log("way", way.Tags)
            } )
        }

        this.mapLayer.batchDraw()

        console.log(this.mapLayer.children)
    }

    drawTrafficLights(nodes: WsMessageNode[]) {
        for (const node of nodes) {
            let coords = this.pointTransformer(node)
            let circle = new Konva.Circle({
                x: coords.Lon,
                y: coords.Lat,
                radius: 4,
                fill: 'red'
            })

            this.mapLayer.add(circle)

            circle.draw()
        }

        this.mapLayer.batchDraw()
    }

    pointTransformer(p: Point): Point {
        let ret = new Point(p.Lon, p.Lat)

        ret.Lon -= this.bounds.MinLon
        ret.Lat -= this.bounds.MinLat

        ret.Lon *= document.getElementById(this.mapContainerId).scrollWidth/(this.bounds.MaxLon-this.bounds.MinLon)
        ret.Lat *= document.getElementById(this.mapContainerId).scrollHeight/(this.bounds.MaxLat-this.bounds.MinLat)

        ret.Lat = document.getElementById(this.mapContainerId).scrollHeight - ret.Lat

        return ret
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