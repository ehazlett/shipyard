package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var containersCommand = cli.Command{
	Name:   "containers",
	Usage:  "list containers",
	Action: containersAction,
}

func containersAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	containers, err := m.Containers()
	if err != nil {
		logger.Fatalf("error getting containers: %s", err)
	}
	if len(containers) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "ID\tImage\tName\tHost\tState\tPorts")
	for _, c := range containers {
		portDefs := []string{}
		for _, port := range c.Ports {
			p := fmt.Sprintf("%s/:%s:%d:%d", port.Proto, port.HostIp, port.Port, port.ContainerPort)
			portDefs = append(portDefs, p)
		}
		ports := strings.Join(portDefs, ", ")
		name := c.Name[1:]
		fmt.Fprintf(w, fmt.Sprintf("%s\t%s\t%s\t%s\t%v\t%s\n", c.ID[:12], c.Image.Name, name, c.Engine.ID, c.State, ports))
	}
	w.Flush()
}

var containerInspectCommand = cli.Command{
	Name:   "inspect",
	Usage:  "inspect container",
	Action: containerInspectAction,
}

func containerInspectAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	args := c.Args()
	if len(args) == 0 {
		logger.Fatalf("you must specify a container id")
	}
	containerId := args[0]
	container, err := m.GetContainer(containerId)
	if err != nil {
		logger.Fatalf("error getting container info: %s", err)
	}
	b, err := json.MarshalIndent(container, "", "    ")
	fmt.Println(string(b))
}
