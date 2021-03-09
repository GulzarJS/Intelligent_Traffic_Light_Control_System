import {CommandRouter, WsMessage} from "./commandrouter";
import WsCommander from "./wscommander";
import {AsyncEvent} from "ts-events";

export default class App {
    public cRouter: CommandRouter
    readonly ws: WebSocket
    private wsCommander: WsCommander
    public boundsListener: AsyncEvent<WsBounds>
    public waysListener: AsyncEvent<WsMessageWay[]>
    public trafficLightsListener: AsyncEvent<WsMessageNode[]>

    constructor(ws: WebSocket, wsCommander: WsCommander) {
        this.ws = ws
        this.cRouter = new CommandRouter(ws)
        this.wsCommander = wsCommander

        this.initializeListeners()
        this.initializeRoutes()
        this.initializeWs()
    }

    private initializeRoutes(){
        this.cRouter.add("init", (this.init).bind(this))
        this.cRouter.add("ways", (this.gotWays).bind(this))
        this.cRouter.add("bounds", (this.gotBounds).bind(this))
        this.cRouter.add("traffic_lights", (this.gotTrafficLights).bind(this))
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
        this.boundsListener = new AsyncEvent<WsBounds>()
        this.trafficLightsListener = new AsyncEvent<WsMessageNode[]>()
    }

    private init(message: WsMessage<string>){
        this.wsCommander.getBounds()
    }

    private gotWays(message: WsMessage<WsMessageWay[]>) {
        this.waysListener.post(message.Body)
    }

    private gotBounds(message: WsMessage<WsBounds>) {
        this.boundsListener.post(message.Body)
    }

    private gotTrafficLights(message: WsMessage<WsMessageNode[]>) {
        this.trafficLightsListener.post(message.Body)
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

export interface WsBounds {
    MaxLat: number
    MaxLon: number
    MinLat: number
    MinLon: number
}