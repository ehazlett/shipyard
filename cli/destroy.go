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
}

func destroyAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	containers, err := m.Containers()
	if err != nil {
		fmt.Println("error destroying container: %s\n", err)
		return
	}
	img := c.Args()
	for _, cnt := range containers {
		// this can probably be more efficient
		for _, i := range img {
			if strings.HasPrefix(cnt.ID, i) {
				if err := m.Destroy(cnt); err != nil {
					logger.Fatalf("error destroying container: %s\n", err)
				}
				fmt.Printf("destroyed %s\n", cnt.ID[:12])
			}
		}
	}
}
