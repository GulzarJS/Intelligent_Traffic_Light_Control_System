import {CommandRouter, WsMessage} from "./commandrouter";
import WsCommander from "./wscommander";
import {AsyncEvent} from "ts-events";

export default class App {
    public cRouter: CommandRouter
    readonly ws: WebSocket
    private wsCommander: WsCommander
    public boundsListener: AsyncEvent<WsBounds>
    public waysListener: AsyncEvent<WsMessageWay[]>
    public trafficLightsGroupsListener: AsyncEvent<WsTrafficLightsGroups[]>
    public carsListener: AsyncEvent<WsCar[]>
    public spawnPoints: WsMessageWay[]
    public deSpawnPoints: WsMessageWay[]

    constructor(ws: WebSocket, wsCommander: WsCommander) {
        this.ws = ws
        this.cRouter = new CommandRouter(ws)
        this.wsCommander = wsCommander
        this.spawnPoints = []
        this.deSpawnPoints = []

        this.initializeListeners()
        this.initializeRoutes()
        this.initializeWs()
    }

    private initializeRoutes(){
        this.cRouter.add("init", (this.init).bind(this))
        this.cRouter.add("ways", (this.gotWays).bind(this))
        this.cRouter.add("bounds", (this.gotBounds).bind(this))
        this.cRouter.add("traffic_lights_groups", (this.gotTrafficLightsGroups).bind(this))
        this.cRouter.add("cars", (this.gotCars).bind(this))
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
        this.trafficLightsGroupsListener = new AsyncEvent<WsTrafficLightsGroups[]>()
        this.carsListener = new AsyncEvent<WsCar[]>()
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

    private gotTrafficLightsGroups(message: WsMessage<WsTrafficLightsGroups[]>) {
        this.trafficLightsGroupsListener.post(message.Body)
    }

    private gotCars(message: WsMessage<WsCar[]>) {
        this.carsListener.post(message.Body)
    }

    spawnCars() {
        let spawnPoints: bigint[] = []
        for (const spawnPoint of this.spawnPoints) {
            let node = spawnPoint.Node1
            spawnPoints.push(node.ID)
        }

        let despawnPoints: bigint[] = []
        for (const despawnPoint of this.deSpawnPoints) {
            despawnPoints.push(despawnPoint.Node1.ID)
        }


        this.wsCommander.spawnCars(spawnPoints, despawnPoints)

        this.spawnPoints = []
        this.deSpawnPoints = []
    }
}

export interface WsMessageNode {
    ID: bigint
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

export interface WsTrafficLightsGroups {
    TrafficLights: WsTrafficLight[]
}

export interface WsTrafficLight {
    Node: WsMessageNode
    LastGreen: Date
    GreenDurationSeconds: number
    RedDurationSeconds: number
    OnWay: WsMessageWay
    CenterNode: WsMessageNode
}

export interface WsCar {
    ID: number
    Lat: number
    Lon: number
}