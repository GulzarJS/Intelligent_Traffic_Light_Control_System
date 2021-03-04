package commandrouter

import (
	"errors"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"regexp"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type CommandRouter struct {
	routes        map[*regexp.Regexp]Route
	routesOrdered []*regexp.Regexp
	rotesMux      sync.Mutex
}

func NewCommandRouter() *CommandRouter {
	return &CommandRouter{
		routes:        make(map[*regexp.Regexp]Route, 0),
		routesOrdered: make([]*regexp.Regexp, 0),
	}
}

type Route func(RouteArgs)
type RouteArgs struct {
	Params map[string]string
	Ws     *websocket.Conn
}

func (r *CommandRouter) Add(regex string, f Route) {
	compRegEx := regexp.MustCompile(regex)

	r.rotesMux.Lock()
	defer r.rotesMux.Unlock()
	r.routes[compRegEx] = f
	r.routesOrdered = append(r.routesOrdered, compRegEx)
}

func (r *CommandRouter) Match(command string, ws *websocket.Conn) error {
	r.rotesMux.Lock()
	var match *regexp.Regexp
	for _, v := range r.routesOrdered {
		if v.MatchString(command) {
			match = v
			break
		}
	}

	if match == nil {
		return errors.New("command does not match with any routes")
	}

	f, exists := r.routes[match]

	if !exists {
		return errors.New("command does not match with any routes")
	}

	args := RouteArgs{
		Params: getParams(match, command),
		Ws:     ws,
	}
	go f(args)

	return nil
}

func (r *CommandRouter) MonitorRouteMiddleware(route Route, args RouteArgs) {
	defer misc.TimeTaken(time.Now(), "route func")
	route(args)
}

func getParams(regEx *regexp.Regexp, command string) (paramsMap map[string]string) {
	match := regEx.FindStringSubmatch(command)

	paramsMap = make(map[string]string)
	for i, name := range regEx.SubexpNames() {
		if i > 0 && i <= len(match) {
			paramsMap[name] = match[i]
		}
	}
	return paramsMap
}
