package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/paulmach/osm/osmxml"
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
	objs, err := loadOSM("./map.osm")
	misc.LogError(err, true, "Error loading osm objects")

	app := NewApp(objs)

	_ = app

	http.HandleFunc("/", app.serveWs)
	http.HandleFunc("/objs", func(w http.ResponseWriter, r *http.Request) {
		enc := json.NewEncoder(w)
		enc.SetIndent("", "	")
		if err := enc.Encode(objs); err != nil {
			misc.LogError(err, false, "cannot encode objs")
			w.WriteHeader(502)
		}
	})
	err = http.ListenAndServe(":8080", nil)
	misc.LogError(err, true, "Cannot listen on :8080")
}

func loadOSM(filePath string) (osm.Objects, error) {
	defer misc.TimeTaken(time.Now(), "loadOSM")

	var objs osm.Objects

	f, err := os.Open("./map.osm")

	if err != nil {
		return nil, fmt.Errorf("main.go:45 cannot open file: %v", err)
	}

	defer f.Close()

	scannerVar := osmxml.New(context.Background(), f)

	i := 0
	for scannerVar.Scan() {
		obj := scannerVar.Object()
		objs = append(objs, obj)
		i++
	}

	if err := scannerVar.Err(); err != nil {
		return nil, fmt.Errorf("main.go:63 scanner returned error: %v", err)
	}
	return objs, nil
}
