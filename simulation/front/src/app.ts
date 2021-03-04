import {CommandRouter, WsMessage} from "./commandrouter";
import {Commands} from "./commands";


export default class App {
    public cRouter: CommandRouter
    readonly ws: WebSocket

    constructor(ws: WebSocket) {
        this.ws = ws
        this.cRouter = new CommandRouter(ws)
        this.initializeRoutes()
        this.initializeWs()
    }

    initializeRoutes(){
        this.cRouter.add("nodes", this.printMap)
    }

    initializeWs(){
        this.ws.addEventListener('open', (event => {
            this.ws.send(Commands.initCommand())
        }))

        this.ws.addEventListener('message', (event) => {
            console.log("Message from server", event.data)
            this.cRouter.match(event.data)
        })

        this.ws.addEventListener('close', (event) => {
            console.log("Server closed. Reason: ", event.reason)
        })
    }

    printMap(message: WsMessage<Array<WsMessageNodes>>){
        message.ws.send("received")
        console.log(message.Body)
    }
}

interface WsMessageNodes {
    id: bigint
    lat: number
    lon: number
    tags: object
}