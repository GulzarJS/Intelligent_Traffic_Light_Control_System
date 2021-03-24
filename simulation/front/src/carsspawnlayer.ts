import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";


export class CarsSpawnLayer {

    private ui: AppUI
    private stage: Stage.Stage
    private layer: Stage.Layer
    private playBtn: Konva.Image


    constructor(ui: AppUI) {

        this.ui = ui
        this.stage = ui.stage

        this.layer = new Konva.Layer()

        Konva.Image.fromURL('play-button.png', (img: Konva.Image) => {
            img.setAttrs({
                x: document.getElementById(this.ui.mapContainerId).scrollWidth/2 - 64,
                y: 20,
            })

            this.playBtn = img
            this.playBtn.hide()
            this.layer.add(img)
        })



        this.stage.add(this.layer)
        this.drawLayer()
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

    showPlayButton() {
        this.playBtn.show()
    }

    hidePlayButton() {
        this.playBtn.hide()
    }

    addWedge(wedge: Konva.Wedge) {
        this.layer.add(wedge)
    }
}
