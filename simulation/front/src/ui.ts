import Konva from 'konva'
import Stage from 'konva'
import App, {WsBounds, WsMessageWay} from "./app";
import WsCommander from "./wscommander";

export class AppUI {
    public stage: Stage.Stage
    public mapLayer: Stage.Layer
    private wsCommander: WsCommander
    private bounds: WsBounds

    constructor(wsCommander: WsCommander, app: App) {
        this.wsCommander = wsCommander
        this.stage = new Konva.Stage({
            container: 'mapContainer',
            width: document.getElementById('mapContainer').scrollWidth,
            height: document.getElementById('mapContainer').scrollHeight
        })

        this.mapLayer = new Konva.Layer()

        this.stage.add(this.mapLayer)

        app.boundsListener.attach((bounds: WsBounds) => {
            this.bounds = bounds
            wsCommander.getWays()
        })
        app.waysListener.attach(this.drawWays)
    }

    drawWays(ways: WsMessageWay[]){
        for (const way of ways) {
            //TODO: Draw lines
            let aPoint = this.pointLocator(new Point(way.Node1.Lon, way.Node1.Lat))
            let bPoint = this.pointLocator(new Point(way.Node2.Lon, way.Node2.Lat))

            let line = new Konva.Line({
                points: [aPoint.Lon, aPoint.Lat, bPoint.Lon, bPoint.Lat],
                stroke: 'black',
                strokeWidth: 2
            })

            this.mapLayer.add(line)
        }

        this.mapLayer.draw()
    }

    pointLocator(p: Point): Point {
        let ret = new Point(p.Lon, p.Lat)

        ret.Lon -= this.bounds.MinLon
        ret.Lat -= this.bounds.MinLat

        ret.Lon *= document.getElementById('mapContainer').scrollWidth/(this.bounds.MaxLon-this.bounds.MinLon)
        ret.Lat *= document.getElementById('mapContainer').scrollHeight/(this.bounds.MaxLat-this.bounds.MinLat)
        return ret
    }
}

class Point {
    Lon: number
    Lat: number
    constructor(lon, lat: number) {
        this.Lat = lat
        this.Lon = lon
    }
}