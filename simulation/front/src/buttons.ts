import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";

export class ButtonUI{

    public stage: Stage.Stage
    public layer: Stage.Layer
    public ui: AppUI

    constructor(ui: AppUI){
        this.ui = ui
        this.stage = ui.stage

        this.layer = new Konva.Layer()
        this.layer.hide()
        this.stage.add(this.layer)

        this.setupLayer()

    }

    setupLayer(){

        let border = new Konva.Rect({
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

        this.layer.add(border)
        let setGreenDur = this.createButtons('Set Green Light Duration', 20, 20);
        let setRedDur = this.createButtons('Set Red Light Duration', 20, 70);
        let entrustAI = this.createButtons('Entrust AI', 20, 120);
        let exit = this.createButtons('Exit', 20, 170);


        exit.on('click', () => {
            this.layer.hide()
        })

        setGreenDur.on('click', () => {
            alert('clicked on setGreenDur button');
        })

        setRedDur.on('click', () => {
            alert('clicked on setRedDur button');
        })

        entrustAI.on('click', () => {
            alert('clicked on entrust AI button');
        })

        this.layer.draw()
    }

    createButtons(name: string, x: number, y: number): Konva.Label {

        let button = new Konva.Label({
            x: x,
            y: y,
            opacity: 0.75
        });


        this.layer.add(button);


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

        this.layer.draw();

        return button
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