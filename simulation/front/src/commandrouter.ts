import App from "./app"

export class CommandRouter {
    private routes: Array<Route>
    private readonly ws: WebSocket

    constructor(ws: WebSocket) {
        this.routes = []
        this.ws = ws
    }

    public add(type: string, routeCallback: any) {
        this.routes.push(new Route(type, routeCallback))
    }

    public match(message: string) {
        let obj: WsMessage<any> = JSON.parse(message)

        console.log("parsed obj", obj)
        obj.ws = this.ws

        for (let route of this.routes) {
            if (route.type == obj.Type) {
                route.route(obj)
                return
            }
        }
    }
}

export class Route {
    public type: string
    public route: any

    constructor(type: string, routeFunc: any) {
        this.type = type
        this.route = routeFunc
    }
}

export interface WsMessage <T> {
    Type: string
    ws: WebSocket
    Body: T
}
