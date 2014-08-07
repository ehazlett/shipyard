package main

import (
	"fmt"
	"strings"

	"github.com/codegangsta/cli"
)

var destroyCommand = cli.Command{
	Name:      "destroy",
	ShortName: "d",
	Usage:     "destroy a container",
	Action:    destroyAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "id, i",
			Usage: "container id",
		},
	},
}

func destroyAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	containers, err := m.GetContainers()
	if err != nil {
		fmt.Println("error destroying container: %s\n", err)
		return
	}
	for _, cnt := range containers {
		if strings.HasPrefix(cnt.ID, c.String("id")) {
			if err := m.Destroy(cnt); err != nil {
				logger.Fatalf("error destroying container: %s\n", err)
			}
			fmt.Printf("destroyed %s\n", cnt.ID[:12])
		}
	}
}
