package main

import (
	"strings"
)

func parseEnvironmentVariables(pairs []string) map[string]string {
	env := make(map[string]string)
	for _, p := range pairs {
		parts := strings.Split(p, "=")
		if len(parts) != 2 {
			logger.Error("environment variables must be in key=value pairs")
			return nil
		}
		k := parts[0]
		v := parts[1]
		env[k] = v
	}
	return env
}
