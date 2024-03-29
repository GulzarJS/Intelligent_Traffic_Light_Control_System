package commandrouter

import (
	"errors"
	"fmt"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/misc"
	"github.com/GulzarJS/Intelligent_Traffic_Light_Control_System/simulation/wshelper"
	"regexp"
	"sync"
	"time"
)

type CommandRouter struct {
	routes        map[*regexp.Regexp]Route
	routesOrdered []*regexp.Regexp
	routesMux     sync.Mutex
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
	Ws     *wshelper.WsConn
}

func (r *CommandRouter) Add(regex string, f Route) {
	compRegEx := regexp.MustCompile(regex)

	r.routesMux.Lock()
	defer r.routesMux.Unlock()
	r.routes[compRegEx] = f
	r.routesOrdered = append(r.routesOrdered, compRegEx)
}

func (r *CommandRouter) Match(command string, ws *wshelper.WsConn) error {
	r.routesMux.Lock()
	defer r.routesMux.Unlock()
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
	go r.MonitorRouteMiddleware(match.String(), f, args)
	return nil
}

func (r *CommandRouter) MonitorRouteMiddleware(regex string, route Route, args RouteArgs) {
	defer misc.TimeTaken(time.Now(), fmt.Sprintf("route func %s", regex))
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
