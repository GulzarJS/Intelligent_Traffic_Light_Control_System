import Konva from 'konva'

var stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight
});

var layer = new Konva.Layer();
stage.add(layer);

var button = new Konva.Label({
    x: 20,
    y: 20,
    opacity: 0.75
});
layer.add(button);

button.add(new Konva.Tag({
    fill: 'black',
    lineJoin: 'round',
    shadowColor: 'black',
    shadowBlur: 10,
    // shadowOffset: 10,
    shadowOpacity: 0.5
}));

button.add(new Konva.Text({
    text: 'Canvas button',
    fontFamily: 'Calibri',
    fontSize: 18,
    padding: 5,
    fill: 'white'
}));


button.on('click', () => {
    alert('clicked on canvas button');
})

document.querySelector('#button').addEventListener('click', () => {
    alert('clicked on DOM button');
})

layer.draw();