import Konva from 'konva'
import Stage from 'konva'
import App, {WsBounds, WsMessageNode, WsMessageWay} from "./app";
import WsCommander from "./wscommander";

export class AppUI {
    public stage: Stage.Stage
    public mapLayer: Stage.Layer
    public trafficLightsUILayer: Stage.Layer
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
        this.trafficLightsUILayer = new Konva.Layer()

        this.stage.add(this.mapLayer)
        this.stage.add(this.trafficLightsUILayer);

        app.boundsListener.attach((bounds: WsBounds) => {
            this.bounds = bounds
            wsCommander.getWays()
            wsCommander.getTrafficLights()
        })
        app.waysListener.attach((this.drawWays).bind(this))
        app.trafficLightsListener.attach((this.drawTrafficLights).bind(this))


        // let names = ['Set Green Light Duration', 'Set Red Light Duration', 'Entrust AI'];
        // this.drawButtons(names,20,20)

        this.createButtons('Set Green Light Duration', 20, 20);
        this.createButtons( 'Set Red Light Duration', 20, 50);
        this.createButtons('Entrust AI', 20, 80);


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


    // drawButtons(names: string[], initialX: number, initialY: number ){
    //
    //     let currentY = initialY;
    //
    //
    //     for (var i=0;i < names.length; i++) {
    //         this.createButtons(names[i], initialX, currentY);
    //
    //         currentY += 30
    //
    //     }
    //
    // }

    createButtons(name: string, x: number, y: number) {

        var button = new Konva.Label({
            x: x,
            y: y,
            opacity: 0.75
        });
        this.mapLayer.add(button);

        button.add(new Konva.Tag({
            fill: 'black',
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            // shadowOffset: 10,
            shadowOpacity: 0.5
        }));


        button.add(new Konva.Text({
            text: name,
            fontFamily: 'Calibri',
            fontSize: 24,
            padding: 5,
            fill: 'white'
        }));


        button.on('click', () => {
            alert('clicked on ' + name + ' button');
        })

        this.mapLayer.draw();
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