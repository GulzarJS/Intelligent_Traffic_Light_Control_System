import Konva from 'konva'
import Stage from 'konva'

import {AppUI} from "./ui";

export class ButtonUI{

    public stage: Stage.Stage
    public layer: Stage.Layer

    public greenLightDuration: number
    public redLightDuration: number

    constructor(stage: Stage.Stage, greenLightDuration: number, redLightDuration: number ){

        this.stage = stage

        this.layer = new Konva.Layer()

        this.stage.add(this.layer)

        this.layer.hide()

        this.greenLightDuration = greenLightDuration
        this.redLightDuration = redLightDuration

        this.setupLayer()

    }

    setupLayer(){

        // this.clearLayer();

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
        let setGreenDur = this.createButtons('Green Light Duration', 20, 20);
        let setRedDur = this.createButtons('Red Light Duration', 20, 70);
        let entrustAI = this.createButtons('Entrust AI', 20, 120);
        let exit = this.createButtons('Exit', 20, 170);
        let submit = this.createButtons('Submit', 300, 170);
        let gLDuration = this.createTextField(String(this.greenLightDuration), 260,30, this.greenLightDuration)
        let rLDuration = this.createTextField(String(this.redLightDuration), 260,80, this.redLightDuration)


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

        submit.on('click', () => {
            alert('clicked on Submit button');
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


    createTextField(text: string, x: number, y: number, duration: number): Konva.Text {

        let textNode = new Konva.Text({
            text: text,
            x: x,
            y: y,
            fontSize: 24,
        });

        this.layer.add(textNode);
        this.layer.draw();


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
                    this.layer.draw();
                    document.body.removeChild(textArea);
                }
            });
        });


        return textNode
    }

    clearLayer(){
        this.layer.remove();
        this.layer = new Konva.Layer();
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

    setGreenLightDuration(duration: number){
        this.greenLightDuration = duration
        // this.setupLayer()
        this.layer.draw();
    }

    setRedLightDuration(duration: number){
        this.redLightDuration = duration
        // this.setupLayer()
        this.layer.draw();

    }

}