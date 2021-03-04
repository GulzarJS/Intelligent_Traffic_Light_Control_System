import App from "./app";

const socket = new WebSocket('ws://localhost:9090/')

const app = new App(socket)