import Konva from 'konva'
import Stage from 'konva'
import App, {WsBoundRatio, WsMessageWay} from "./app";
import WsCommander from "./wscommander";

export class AppUI {
    public stage: Stage.Stage
    public mapLayer: Stage.Layer
    private wsCommander: WsCommander
    private boundRatio: WsBoundRatio

    constructor(wsCommander: WsCommander, app: App) {
        this.wsCommander = wsCommander
        this.stage = new Konva.Stage({
            container: 'mapContainer',
            width: document.getElementById('mapContainer').scrollWidth,
            height: document.getElementById('mapContainer').scrollHeight
        })

        this.mapLayer = new Konva.Layer()

        this.stage.add(this.mapLayer)

        app.boundRatioListener.attach((boundRatio: WsBoundRatio) => {
            this.boundRatio = boundRatio
            wsCommander.getWays()
        })
        app.waysListener.attach(this.drawWays)
    }

    drawWays(ways: WsMessageWay[]){
        for (const way of ways) {
            //TODO: Draw lines
        }
    }
}