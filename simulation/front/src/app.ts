import {CommandRouter, WsMessage} from "./commandrouter";
import WsCommander from "./wscommander";
import {AsyncEvent} from "ts-events";

export default class App {
    public cRouter: CommandRouter
    readonly ws: WebSocket
    readonly wsCommander: WsCommander
    public boundRatioListener: AsyncEvent<WsBoundRatio>
    public waysListener: AsyncEvent<WsMessageWay[]>

    constructor(ws: WebSocket, wsCommander: WsCommander) {
        this.ws = ws
        this.cRouter = new CommandRouter(ws)
        this.wsCommander = wsCommander
        this.initializeListeners()
        this.initializeRoutes()
        this.initializeWs()
    }

    private initializeRoutes(){
        this.cRouter.add("init", this.init)
        this.cRouter.add("nodes", this.gotWays)
        this.cRouter.add("boundratio", this.gotBoundRatio)
    }

    private initializeWs(){
        this.ws.addEventListener('open', (event => {
            this.wsCommander.init()
        }))

        this.ws.addEventListener('message', (event) => {
            // console.log("Message from server", event.data)
            this.cRouter.match(event.data)
        })

        this.ws.addEventListener('close', (event) => {
            console.log("Server closed. Reason: ", event.reason)
        })
    }

    private initializeListeners() {
        this.waysListener = new AsyncEvent<WsMessageWay[]>()
        this.boundRatioListener = new AsyncEvent<WsBoundRatio>()
    }

    private init(message: WsMessage<string>){
        this.wsCommander.getBounds()
    }

    private gotWays(message: WsMessage<WsMessageWay[]>) {
        this.waysListener.post(message.Body)
    }

    private gotBoundRatio(message: WsMessage<WsBoundRatio>) {
        this.boundRatioListener.post(message.Body)
    }
}

export interface WsMessageNode {
    Id: bigint
    Lat: number
    Lon: number
}

export interface WsMessageWay {
    Distance: number
    Node1: WsMessageNode
    Node2: WsMessageNode
    Tags: any
}

export interface WsBoundRatio {
    X: number
    Y: number
}