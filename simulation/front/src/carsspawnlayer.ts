import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";


export class CarsSpawnLayer {

    private ui: AppUI
    private stage: Stage.Stage
    private layer: Stage.Layer


    constructor(ui: AppUI) {

        this.ui = ui
        this.stage = ui.stage

        this.layer = new Konva.Layer()

        this.stage.add(this.layer)

        this.layer.hide()

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


    getlayer(): Konva.Layer {
        return this.layer;
    }
}
