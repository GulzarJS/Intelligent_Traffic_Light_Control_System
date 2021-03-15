import App from "./app";
import {AppUI} from "./ui";
import WsCommander from "./wscommander";
// import Konva from "konva";

const socket = new WebSocket('ws://localhost:9090/')

const wsCommander = new WsCommander(socket)

const app = new App(socket, wsCommander)

const ui = new AppUI(wsCommander, app)


ui.drawButtons('Set Green Light Duration', 20, 20);
ui.drawButtons('Set Red Light Duration',40, 40)
ui.drawButtons('Entrust AI', 60, 60);