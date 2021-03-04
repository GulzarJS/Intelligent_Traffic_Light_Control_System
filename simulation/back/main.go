package main

import (
	"encoding/json"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

type clients struct {
	clients map[*websocket.Conn]bool
	mux     sync.Mutex
}

func main() {
	osmHelper, err := osmhelper.NewOsmHelper("./map.osm")
	misc.LogError(err, true, "Error loading osmHelper")

	app := NewApp(osmHelper)

	_ = app

	http.HandleFunc("/", app.serveWs)
	http.HandleFunc("/objs", func(w http.ResponseWriter, r *http.Request) {
		enc := json.NewEncoder(w)
		enc.SetIndent("", "	")
		if err := enc.Encode(osmHelper.Objects); err != nil {
			misc.LogError(err, false, "cannot encode objs")
			w.WriteHeader(502)
		}
	})
	err = http.ListenAndServe(":9090", nil)
	misc.LogError(err, true, "Cannot listen on :9090")
}
