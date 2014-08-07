package main

import (
	"fmt"
	"github.com/codegangsta/cli"
)

var containersCommand = cli.Command{
	Name:      "containers",
	ShortName: "c",
	Usage:     "list containers",
	Action:    containersAction,
}

func containersAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	containers, err := m.GetContainers()
	if err != nil {
		logger.Fatalf("error getting containers: %s", err)
	}
	if len(containers) == 0 {
		return
	}
	d := NewDisplay(18, 30, ' ')
	d.Write(fmt.Sprintf("ID\tName\tHost"))
	for _, c := range containers {
		d.Write(fmt.Sprintf("%s\t%s\t%s", c.ID[:12], c.Image.Name, c.Engine.Addr))
	}
}
