package main

import (
	"fmt"
	"strings"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var restartCommand = cli.Command{
	Name:        "restart",
	Usage:       "restart a container",
	Description: "restart <id> [<id>]",
	Action:      restartAction,
}

func restartAction(c *cli.Context) {
	cfg, err := loadConfig(c)
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
				if err := m.Restart(cnt); err != nil {
					logger.Fatalf("error restarting container: %s\n", err)
				}
				fmt.Printf("restarted %s\n", cnt.ID[:12])
			}
		}
	}
}
