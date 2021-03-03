function bodyOnLoad() {
    const socket = new WebSocket('ws://back:8080/back/ws')

    socket.addEventListener('open', (event => {
        socket.send("/init")
    }))

    socket.addEventListener('message', (event) => {
        console.log("Message from server", event.data)
    })



    socket.addEventListener('close', (event) => {
        console.log("Server closed. Reason: ", event.reason)
    })
}