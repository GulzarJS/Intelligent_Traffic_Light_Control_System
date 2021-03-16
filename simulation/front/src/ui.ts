import Konva from 'konva'
import Stage from 'konva'
import { Layer } from 'konva/types/Layer';
import { Circle } from 'konva/types/shapes/Circle';
import App, {WsBounds, WsMessageNode, WsMessageWay, WsTrafficLight, WsTrafficLightsGroups} from "./app";
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
        this.trafficLightsUILayer = new  Konva.Layer()

        this.stage.add(this.mapLayer)


        app.boundsListener.attach((bounds: WsBounds) => {
            this.bounds = bounds
            wsCommander.getWays()
            wsCommander.getTrafficLightsGroups()
        })
        app.waysListener.attach((this.drawWays).bind(this))
        // app.trafficLightsListener.attach((this.drawTrafficLights).bind(this))

        // this.drawButtons()

        this.createButtons("Open Button Layer", 20, 20)

        app.trafficLightsGroupsListener.attach((this.drawTrafficLights).bind(this))
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
                console.log("way", way)
            } )
        }

        this.mapLayer.batchDraw()

        console.log(this.mapLayer.children)
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

            nodeCircle.on('dblclick', () => {
                alert('clicked on circle');
            })

            this.mapLayer.add(nodeCircle)



            nodeCircle.draw()



            for (const node of trafficLightsGroup.TrafficLights) {
                let coords = this.pointTransformer(node.Node)

                let diffSeconds = (new Date()).getTime() - (new Date(node.LastGreen)).getTime()/1000
                // if (diffSeconds > 3)
                //     console.log(diffSeconds)
                diffSeconds = diffSeconds%(node.RedDurationSeconds + node.RedDurationSeconds)
                let fill = ''
                let duration = 0

                if (diffSeconds > 0 && diffSeconds < node.GreenDurationSeconds) {
                    fill = 'green'
                    duration = node.GreenDurationSeconds - diffSeconds
                } else {
                    fill = 'red'
                    duration = node.RedDurationSeconds - (diffSeconds - node.GreenDurationSeconds)
                }

                console.log(duration)

                let circle = new Konva.Circle({
                    x: coords.Lon,
                    y: coords.Lat,
                    radius: 6,
                    fill: fill
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


    drawButtons(){

        this.stage.add(this.trafficLightsUILayer);

        this.createButtons('Set Green Light Duration', 20, 20);
        this.createButtons( 'Set Red Light Duration', 20, 60);
        this.createButtons('Entrust AI', 20, 100);




    }

    createButtons(name: string, x: number, y: number) {

        let button = new Konva.Label({
            x: x,
            y: y,
            opacity: 0.75
        });




        if(name == 'Open Button Layer'){
            this.mapLayer.add(button);
        }else{

            this.trafficLightsUILayer.add(button);
        }
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
            if(name == 'Open Button Layer'){
                this.drawButtons()
            }else{

            alert('clicked on ' + name + ' button');
            }
        })

        if(name == 'Open Button Layer'){

            this.mapLayer.draw();

        }else{

            this.trafficLightsUILayer.draw();
        }
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



    findTrafficLightsGroupCenter(t: WsTrafficLightsGroups): Point {
        let p = new Point(0,0)

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
        }
        else
            circle.fill('red')
        l.batchDraw()
        setTimeout(() => this.toggleTrafficLightFill(circle, t, l), duration)
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