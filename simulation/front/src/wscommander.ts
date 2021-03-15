export default class WsCommander {
    private readonly ws: WebSocket
    constructor(ws: WebSocket) {
        this.ws = ws
    }
    public init() {
        this.ws.send("/init")
    }

    public getWays() {
        this.ws.send("/getWays")
    }

    public getBounds() {
        this.ws.send("/getBounds")
    }

    public getTrafficLightsGroups() {
        this.ws.send("/getTrafficLightsGroups")
    }

    public setGreenLightDuration() {
        this.ws.send("/setGreenLightDuration")
    }

    public setRedLightDuration() {
        this.ws.send("/setRedLightDuration")
    }
}