import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";
import {Buttons} from "./buttons";
import {TextField} from "./textField";
import { WsTrafficLight } from './app';


export class TrafficLightUILayer {

    private ui: AppUI
    private stage: Stage.Stage
    private layer: Stage.Layer

    private activeTrafficLightCircle: Konva.Circle
    private greenDurTxtField: TextField
    private redDurTxtField: TextField

    constructor(ui: AppUI) {

        this.ui = ui
        this.stage = ui.stage

        this.layer = new Konva.Layer()

        this.stage.add(this.layer)

        this.layer.hide()

        this.setupLayer()

    }


    setupLayer() {

        let border = new Konva.Rect({
            x: 5,
            y: 5,
            width: 400,
            height: 250,
            fill: 'gray',
            stroke: 'gray',
            strokeWidth: 4,
            draggable: true,
            shadowColor: 'gray',
            shadowBlur: 10,
            shadowOpacity: 0.5
        })

        this.layer.add(border)
        let setGreenDur = new Buttons(this.layer, 'Green Light Duration', 20, 20);
        let setRedDur = new Buttons(this.layer, 'Red Light Duration', 20, 70);
        let entrustAI = new Buttons(this.layer, 'Entrust AI', 20, 120);
        let exit = new Buttons(this.layer, 'Exit', 20, 170);
        let submit = new Buttons(this.layer, 'Submit', 300, 170);

        let gLDuration = new TextField(this.stage, this.layer, String(0), 260, 30)
        let rLDuration = new TextField(this.stage, this.layer, String(0), 260, 80)

        this.greenDurTxtField = gLDuration
        this.redDurTxtField = rLDuration

        exit.getButton.on('click', () => {
            this.hideLayer()
        })

        setGreenDur.getButton.on('click', () => {
            alert('clicked on setGreenDur button');
        })

        setRedDur.getButton.on('click', () => {
            alert('clicked on setRedDur button');
        })

        entrustAI.getButton.on('click', () => {
            alert('clicked on entrust AI button');
        })

        submit.getButton.on('click', () => {
            alert('clicked on Submit button');
        })
    }

    showLayer(trafficLight: WsTrafficLight){
        let circleCoords = this.ui.pointTransformer(trafficLight.Node)
        let activeTrafficLightCircle = new Konva.Circle({
            x: circleCoords.Lon,
            y: circleCoords.Lat,
            radius: 15,
            stroke: 'gray',
            strokeWidth: 2,
        })

        this.layer.add(activeTrafficLightCircle)
        this.activeTrafficLightCircle = activeTrafficLightCircle

        this.redDurTxtField.setText(String(trafficLight.RedDurationSeconds))
        this.greenDurTxtField.setText(String(trafficLight.GreenDurationSeconds))

        this.layer.show()
        this.layer.draw()
    }

    hideLayer(){
        this.activeTrafficLightCircle.remove()
        this.layer.hide()
    }

    drawLayer(){
        this.layer.draw()
    }
}
