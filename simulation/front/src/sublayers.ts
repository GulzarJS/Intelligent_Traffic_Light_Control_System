import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";

export class SubLayers {

    public ui: AppUI
    public stage: Stage.Stage
    public trafficLightsUILayer: Stage.Layer
    public carsUILayer: Stage.Layer
    public carsSpawnLayer: Stage.Layer

    public greenLightDuration: number
    public redLightDuration: number

    constructor(ui: AppUI){

        this.ui = ui
        this.stage = ui.stage

        this.trafficLightsUILayer = new Konva.Layer()
        this.carsUILayer = new Konva.Layer()
        this.carsSpawnLayer = new Konva.Layer()


        this.stage.add(this.trafficLightsUILayer)
        this.stage.add(this.carsUILayer)
        this.stage.add(this.carsSpawnLayer)

        this.trafficLightsUILayer.hide()
        this.carsUILayer.hide()

        this.greenLightDuration = 0;
        this.redLightDuration = 0;

        this.setupTrafficLightsUILayer()
        this.setUpCarsUILayer()

    }

    setupTrafficLightsUILayer(){

        // this.clearLayer();

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
            // shadowOffset: 10,
            shadowOpacity: 0.5
        })

        this.trafficLightsUILayer.add(border)
        let setGreenDur = this.createButtons('Green Light Duration', 20, 20);
        let setRedDur = this.createButtons('Red Light Duration', 20, 70);
        let entrustAI = this.createButtons('Entrust AI', 20, 120);
        let exit = this.createButtons('Exit', 20, 170);
        let submit = this.createButtons('Submit', 300, 170);
        let gLDuration = this.createTextField(String(this.greenLightDuration), 260,30, this.greenLightDuration)
        let rLDuration = this.createTextField(String(this.redLightDuration), 260,80, this.redLightDuration)


        exit.on('click', () => {
            this.trafficLightsUILayer.hide()
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

        submit.on('click', () => {
            alert('clicked on Submit button');
        })


        this.trafficLightsUILayer.draw()
    }


    setUpCarsUILayer() {
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

        this.carsUILayer.add(border)
        let spawner = this.createButtons('Set as car spawner', 20, 300);
        let despawner = this.createButtons('Set as car despawner', 20, 350);
        let exit = this.createButtons('Exit', 20, 450);

        this.carsUILayer.add(spawner, despawner, exit)

        exit.on('click', () => {
            this.carsUILayer.hide()
        })

        spawner.on('click', () => {
            this.ui.spawnCar()
        })

        despawner.on('click', (event) => {
            this.ui.despawnCar()
        })

        this.carsUILayer.draw()
    }



    createButtons(name: string, x: number, y: number): Konva.Label {

        let button = new Konva.Label({
            x: x,
            y: y,
            opacity: 0.75
        });


        this.trafficLightsUILayer.add(button);


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

        this.trafficLightsUILayer.draw();

        return button
    }


    createTextField(text: string, x: number, y: number, duration: number): Konva.Text {

        let textNode = new Konva.Text({
            text: text,
            x: x,
            y: y,
            fontSize: 24,
        });

        this.trafficLightsUILayer.add(textNode);
        this.trafficLightsUILayer.draw();


        textNode.on('click', () => {

            let textPosition = textNode.getAbsolutePosition();

            let  stagebox = this.stage.container().getBoundingClientRect();

            let areaPosition = {
                x: stagebox.left + textPosition.x,
                y: stagebox.top + textPosition.y - 10,
            };

            let textArea = document.createElement('textarea');
            document.body.appendChild(textArea);

            textArea.value = textNode.text();
            textArea.style.position = 'absolute';
            textArea.style.backgroundColor = 'gray'
            textArea.style.top = areaPosition.y + 'px';
            textArea.style.left = areaPosition.x + 'px';
            // textArea.style.width = String(textNode.width());
            textArea.style.fontSize = String(textNode.fontSize());
            textArea.style.width = textNode.width() - textNode.padding() * 2 + 30 + 'px';


            textArea.focus();

            textArea.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    textNode.text(textArea.value);
                    duration = Number(textArea.value)
                    console.log(duration);
                    this.trafficLightsUILayer.draw();
                    document.body.removeChild(textArea);
                }
            });
        });


        return textNode
    }

    clearLayer(){
        this.trafficLightsUILayer.remove();
        this.trafficLightsUILayer = new Konva.Layer();
    }

    showLayer(){
        this.trafficLightsUILayer.show()
    }

    hideLayer(){
        this.trafficLightsUILayer.hide()
    }

    drawLayer(){
        this.trafficLightsUILayer.draw()
    }

    setGreenLightDuration(duration: number){
        this.greenLightDuration = duration
        // this.setupLayer()
        this.trafficLightsUILayer.draw();
    }

    setRedLightDuration(duration: number){
        this.redLightDuration = duration
        // this.setupLayer()
        this.trafficLightsUILayer.draw();

    }

}