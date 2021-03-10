package main

import (
	"encoding/json"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/osmhelper"
	"net/http"
)

func main() {
	osmHelper, err := osmhelper.NewOsmHelper("./map.osm")
	misc.LogError(err, true, "error loading osmHelper")

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
	misc.LogError(err, true, "cannot listen on :9090")
}
