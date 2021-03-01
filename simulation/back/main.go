package main

import (
	"fmt"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/paulmach/osm"
)

type clients struct {
	clients map[*websocket.Conn]bool
	mux     sync.Mutex
}

func main() {
	objs := loadOSM("./map.osm")

	app := NewApp(objs)

	_ = app

	http.HandleFunc("/ws", app.serveWs)
	err := http.ListenAndServe(":8080", nil)
	misc.LogError(err, true, "Cannot listen on :8080")
}

func loadOSM(filePath string) osm.Objects {
	defer misc.TimeTaken(time.Now(), "loadOSM")
	b, err := os.ReadFile(filePath)
	misc.LogError(err, true, fmt.Sprintf("Cannot read %s", filePath))
	osm, err := osm.UnmarshalOSM(b)
	misc.LogError(err, true, "Cannot unmarshal osm file")
	return osm.Objects()
}
