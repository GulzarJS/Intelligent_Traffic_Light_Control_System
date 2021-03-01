package misc

import (
	"log"
	"time"
)

// TimeTaken logs the time taken for a function.
// Use as defer TimeTaken(time.Now(), "function_name")
func TimeTaken(t time.Time, name string) {
	elapsed := time.Since(t)
	log.Printf("TIME: %s took %s\n", name, elapsed)
}

// LogError logs error and return true if err is not nil
// does nothing and return false otherwise
func LogError(err error, fatal bool, extraMessage string) bool {
	if err != nil {
		if fatal {
			if extraMessage != "" {
				log.Fatalf("[FATAL] %s: %v", extraMessage, err)
			} else {
				log.Fatalf("[FATAL] %v", err)
			}
		}

		if extraMessage != "" {
			log.Printf("[ERROR] %s: %v", extraMessage, err)
		} else {
			log.Printf("[ERROR] %v", err)
		}

		return true
	}

	return false
}

func LogInfo(format string, args ...interface{}) {
	log.Printf("[INFO] "+format, args)
}
