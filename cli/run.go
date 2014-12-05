package main

import (
	"fmt"

	"github.com/citadel/citadel"
	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var runCommand = cli.Command{
	Name:   "run",
	Usage:  "run a container",
	Action: runAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "name",
			Usage: "image name",
		},
		cli.StringFlag{
			Name:  "container-name",
			Usage: "container name",
		},
		cli.StringFlag{
			Name:  "cpus",
			Value: "0.1",
			Usage: "cpu shares",
		},
		cli.StringFlag{
			Name:  "cpuset",
			Value: "",
			Usage: "cpuset to run on",
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
		cli.StringFlag{
			Name:  "hostname",
			Value: "",
			Usage: "container hostname",
		},
		cli.StringFlag{
			Name:  "domain",
			Value: "",
			Usage: "container domain name",
		},
		cli.StringFlag{
			Name:  "network",
			Value: "bridge",
			Usage: "container network mode",
		},
		cli.StringSliceFlag{
			Name:  "env",
			Usage: "environment variables (key=value pairs)",
			Value: &cli.StringSlice{},
		},
		cli.StringSliceFlag{
			Name:  "link",
			Usage: "container link (container:name pair)",
			Value: &cli.StringSlice{},
		},
		cli.StringSliceFlag{
			Name:  "arg",
			Usage: "run arguments",
			Value: &cli.StringSlice{},
		},
		cli.StringSliceFlag{
			Name:  "vol",
			Usage: "volume (/host/path:/container/path or /container/path)",
			Value: &cli.StringSlice{},
		},
		cli.StringSliceFlag{
			Name:  "label",
			Usage: "labels",
			Value: &cli.StringSlice{},
		},
		cli.StringSliceFlag{
			Name:  "port",
			Usage: "expose container ports. usage: --port <proto>/<host-ip>:<host-port>:<container-port> i.e. --port tcp/::8080 --port tcp/:80:8080, tcp/10.1.2.3:80:8080",
			Value: &cli.StringSlice{},
		},
		cli.BoolFlag{
			Name:  "publish",
			Usage: "publish all exposed ports",
		},
		cli.BoolFlag{
			Name:  "pull",
			Usage: "pull the image from the repository",
		},
		cli.IntFlag{
			Name:  "count",
			Usage: "number of instances",
			Value: 1,
		},
		cli.StringFlag{
			Name:  "restart",
			Value: "no",
			Usage: "restart policy for container (on-failure, always, on-failure:5, etc.)",
		},
	},
}

func runAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	if c.String("name") == "" {
		logger.Fatal("you must specify an image name")
	}
	vols := c.StringSlice("vol")
	env := parseEnvironmentVariables(c.StringSlice("env"))
	ports := parsePorts(c.StringSlice("port"))
	links := parseContainerLinks(c.StringSlice("link"))
	policy, maxRetries, err := parseRestartPolicy(c.String("restart"))
	if err != nil {
		logger.Fatalf("error parsing restart policy: %s", err)
	}
	rp := citadel.RestartPolicy{
		Name:              policy,
		MaximumRetryCount: maxRetries,
	}
	image := &citadel.Image{
		Name:          c.String("name"),
		ContainerName: c.String("container-name"),
		Cpus:          c.Float64("cpus"),
		Cpuset:        c.String("cpuset"),
		Memory:        c.Float64("memory"),
		Hostname:      c.String("hostname"),
		Domainname:    c.String("domain"),
		NetworkMode:   c.String("network"),
		Labels:        c.StringSlice("label"),
		Args:          c.StringSlice("arg"),
		Environment:   env,
		Links:         links,
		Publish:       c.Bool("publish"),
		Volumes:       vols,
		BindPorts:     ports,
		RestartPolicy: rp,
		Type:          c.String("type"),
	}
	containers, err := m.Run(image, c.Int("count"), c.Bool("pull"))
	if err != nil {
		logger.Fatalf("error running container: %s\n", err)
	}
	for _, c := range containers {
		fmt.Printf("started %s on %s\n", c.ID[:12], c.Engine.ID)
	}
}
