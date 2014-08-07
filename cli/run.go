package main

import (
	"fmt"

	"github.com/citadel/citadel"
	"github.com/codegangsta/cli"
)

var runCommand = cli.Command{
	Name:      "run",
	ShortName: "r",
	Usage:     "run a container",
	Action:    runAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "name",
			Usage: "image name",
		},
		cli.StringFlag{
			Name:  "cpus",
			Value: "0.1",
			Usage: "cpu shares",
		},
		cli.StringFlag{
			Name:  "memory",
			Value: "256",
			Usage: "memory (in MB)",
		},
		cli.StringFlag{
			Name:  "type",
			Value: "service",
			Usage: "type (service, batch, etc.)",
		},
		cli.StringSliceFlag{
			Name:  "labels",
			Usage: "labels",
			Value: &cli.StringSlice{},
		},
	},
}

func runAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	image := &citadel.Image{
		Name:   c.String("name"),
		Cpus:   c.Float64("cpus"),
		Memory: c.Float64("memory"),
		Labels: c.StringSlice("labels"),
		Type:   c.String("type"),
	}
	container, err := m.Run(image)
	if err != nil {
		logger.Fatalf("error running container: %s", err)
	}
	fmt.Printf("started %s on %s", container.ID[:12], container.Engine.Addr)
}
