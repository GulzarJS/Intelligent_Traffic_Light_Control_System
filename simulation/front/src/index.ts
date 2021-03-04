import App from "./app";
import {AppUI} from "./ui";
import WsCommander from "./wscommander";

const socket = new WebSocket('ws://localhost:9090/')

const wsCommander = new WsCommander(socket)

const app = new App(socket, wsCommander)

const ui = new AppUI(wsCommander, app)