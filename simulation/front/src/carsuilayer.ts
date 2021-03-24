import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";
import {Buttons} from "./buttons";
import {TextField} from "./textField";


export class CarsUILayer {

    private ui: AppUI
    private stage: Stage.Stage
    private layer: Stage.Layer


    constructor(ui: AppUI) {

        this.ui = ui
        this.stage = ui.stage

        this.layer = new Konva.Layer()

        this.stage.add(this.layer)

        this.layer.hide()

        this.setupLayer()
    }

    setupLayer(){

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

        this.layer.add(border)

        let spawner = new Buttons(this.layer,'Set as car spawner', 20, 300);
        let despawner = new Buttons(this.layer,'Set as car despawner', 20, 350);
        let exit = new Buttons(this.layer,'Exit', 20, 450);

        // this.layer.add(spawner.getButton, despawner.getButton, exit.getButton)

        exit.getButton.on('click', () => {
            this.layer.hide()
        })

        spawner.getButton.on('click', () => {
            this.ui.spawnCar()
        })

        despawner.getButton.on('click', (event) => {
            this.ui.despawnCar()
        })

        this.layer.draw()
    }

    showLayer(){
        this.layer.show()
        this.layer.draw()
    }

    hideLayer(){
        this.layer.hide()
    }

    drawLayer(){
        this.layer.draw()
    }

}
