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

    public spawnCars(spawnPoints: bigint[], despawnPoints: bigint[]) {
        let spawnStr = String(spawnPoints[0])
        for (let i = 1; i < spawnPoints.length; i++) {
            spawnStr += "," +spawnPoints[i]
        }

        let despawnStr = String(despawnPoints[0])
        for (let i = 1; i < despawnPoints.length; i++) {
            despawnStr += ","+despawnPoints[i]
        }

        this.ws.send("/spawnCars/"+spawnStr+"/"+despawnStr)
    }
}