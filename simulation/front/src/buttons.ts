import Konva from 'konva'

export class Buttons {

    private layer: Konva.Layer
    private button: Konva.Label



    constructor(layer: Konva.Layer, name: string, x: number, y: number ) {

        this.layer = layer

        this.createButtons(name, x, y)


    }

    createButtons(name: string, x: number, y: number) {

        this.button = new Konva.Label({
            x: x,
            y: y,
            opacity: 0.75
        });


        this.layer.add(this.button);


        this.button.add(new Konva.Tag({
            fill: 'black',
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            // shadowOffset: 10,
            shadowOpacity: 0.5
        }));


        this.button.add(new Konva.Text({
            text: name,
            fontFamily: 'Calibri',
            fontSize: 24,
            padding: 5,
            fill: 'white'
        }));

        this.layer.draw();

    }


    get getButton(): Konva.Label {
        return this.button;
    }


}
