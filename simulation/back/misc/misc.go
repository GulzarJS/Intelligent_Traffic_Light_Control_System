package misc

import (
	"log"
	"runtime"
	"time"
)

// TimeTaken logs the time taken for a function.
// Use as defer TimeTaken(time.Now(), "function_name")
func TimeTaken(t time.Time, name string) {
	elapsed := time.Since(t)
	log.Printf("[TIME] %s took %s\n", name, elapsed)
}

// LogError logs error and return true if err is not nil
// does nothing and return false otherwise
func LogError(err error, fatal bool, extraMessage string) bool {
	pc, fn, line, _ := runtime.Caller(1)
	if err != nil {
		if fatal {
			if extraMessage != "" {
				log.Fatalf("[FATAL] in %s[%s:%d] %s: %v", runtime.FuncForPC(pc).Name(), fn, line, extraMessage, err)
			} else {
				log.Fatalf("[FATAL] in %s[%s:%d] %v", runtime.FuncForPC(pc).Name(), fn, line, err)
			}
		}

		if extraMessage != "" {
			log.Printf("[ERROR] in %s[%s:%d] %s: %v", runtime.FuncForPC(pc).Name(), fn, line, extraMessage, err)
		} else {
			log.Printf("[ERROR] in %s[%s:%d] %v", runtime.FuncForPC(pc).Name(), fn, line, err)
		}

		return true
	}

	return false
}

func LogInfo(format string, args ...interface{}) {
	if len(args) > 0 {
		log.Printf("[INFO] "+format, args...)
	} else {
		log.Println("[INFO] " + format)
	}
}

type IntArray []int64

func (arr IntArray) Contains(i int64) (bool, int) {
	for j, v := range arr {
		if i == v {
			return true, j
		}
	}
	return false, -1
}
