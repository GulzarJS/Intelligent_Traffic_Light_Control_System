import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";
import {Buttons} from "./buttons";
import {TextFields} from "./textfields";


export class TrafficLightUILayer {

    private ui: AppUI
    private stage: Stage.Stage
    private layer: Stage.Layer

    public greenLightDuration: number
    public redLightDuration: number

    constructor(ui: AppUI) {

        this.ui = ui
        this.stage = ui.stage

        this.layer = new Konva.Layer()

        this.stage.add(this.layer)

        this.layer.hide()

        this.greenLightDuration = 0;
        this.redLightDuration = 0;

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

        let gLDuration = new TextFields(this.stage, this.layer, String(this.greenLightDuration), 260, 30)
        let rLDuration = new TextFields(this.stage, this.layer, String(this.redLightDuration), 260, 80)


        exit.getButton.on('click', () => {
            this.layer.hide()
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

    showLayer(){
        this.layer.show()
    }

    hideLayer(){
        this.layer.hide()
    }

    drawLayer(){
        this.layer.draw()
    }


}
