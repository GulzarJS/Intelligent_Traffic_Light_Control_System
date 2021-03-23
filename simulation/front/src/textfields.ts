import Konva from 'konva'

export class TextFields {

    private stage: Konva.Stage
    private layer: Konva.Layer
    private textNode: Konva.Text


    constructor(stage: Konva.Stage, layer: Konva.Layer, text: string, x: number, y: number ) {

        this.stage = stage
        this.layer = layer

        this.createTextField(text, x, y)

    }

    createTextField(text: string, x: number, y: number) {

        this.textNode = new Konva.Text({
            text: text,
            x: x,
            y: y,
            fontSize: 24,
        });

        this.layer.add(this.textNode);
        this.layer.draw();


        this.textNode.on('click', () => {

            let textPosition = this.textNode.getAbsolutePosition();

            let  stagebox = this.stage.container().getBoundingClientRect();

            let areaPosition = {
                x: stagebox.left + textPosition.x,
                y: stagebox.top + textPosition.y - 10,
            };

            let textArea = document.createElement('textarea');
            document.body.appendChild(textArea);

            textArea.value = this.textNode.text();
            textArea.style.position = 'absolute';
            textArea.style.backgroundColor = 'gray'
            textArea.style.top = areaPosition.y + 'px';
            textArea.style.left = areaPosition.x + 'px';
            textArea.style.fontSize = String(this.textNode.fontSize());
            textArea.style.width = this.textNode.width() - this.textNode.padding() * 2 + 30 + 'px';


            textArea.focus();

            textArea.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    this.textNode.text(textArea.value);
                    this.layer.draw();
                    document.body.removeChild(textArea);
                }
            });
        });

    }


    get getTextNode(): Konva.Text {
        return this.textNode;
    }

    setText(text: string) {
        this.setText(text);
    }
}