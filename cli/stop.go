package main

import (
	"fmt"
	"strings"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var stopCommand = cli.Command{
	Name:        "stop",
	Usage:       "stop a container",
	Description: "stop <id> [<id>]",
	Action:      stopAction,
}

func stopAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	containers, err := m.Containers()
	if err != nil {
		logger.Fatalf("error getting container info: %s", err)
	}
	ids := c.Args()
	if len(ids) == 0 {
		logger.Fatalf("you must specify at least one id")
	}
	for _, cnt := range containers {
		// this can probably be more efficient
		for _, i := range ids {
			if strings.HasPrefix(cnt.ID, i) {
				if err := m.Stop(cnt); err != nil {
					logger.Fatalf("error stopping container: %s\n", err)
				}
				fmt.Printf("stopped %s\n", cnt.ID[:12])
			}
		}
	}
}
