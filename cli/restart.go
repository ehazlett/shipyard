package main

import (
	"fmt"
	"strings"

	"github.com/codegangsta/cli"
)

var restartCommand = cli.Command{
	Name:        "restart",
	Usage:       "restart a container",
	Description: "restart <id> [<id>]",
	Action:      restartAction,
	Flags: []cli.Flag{
		cli.IntFlag{
			Name:  "timeout",
			Usage: "time to wait for restart",
			Value: 10,
		},
	},
}

func restartAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	containers, err := m.Containers(true)
	if err != nil {
		fmt.Println("error getting container info: %s\n", err)
		return
	}
	ids := c.Args()
	if len(ids) == 0 {
		logger.Fatalf("you must specify at least one id")
	}
	for _, cnt := range containers {
		// this can probably be more efficient
		for _, i := range ids {
			if strings.HasPrefix(cnt.ID, i) {
				if err := m.Restart(cnt, c.Int("timeout")); err != nil {
					logger.Fatalf("error restarting container: %s\n", err)
				}
				fmt.Printf("restarted %s\n", cnt.ID[:12])
			}
		}
	}
}
