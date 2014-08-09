package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

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
	containers, err := m.Containers()
	if err != nil {
		logger.Fatalf("error getting containers: %s", err)
	}
	if len(containers) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "ID\tName\tHost\tPorts")
	for _, c := range containers {
		portDefs := []string{}
		for _, port := range c.Ports {
			p := fmt.Sprintf("%s/%d:%d", port.Proto, port.ContainerPort, port.Port)
			portDefs = append(portDefs, p)
		}
		ports := strings.Join(portDefs, ", ")
		fmt.Fprintf(w, fmt.Sprintf("%s\t%s\t%s\t%s\n", c.ID[:12], c.Image.Name, c.Engine.ID, ports))
	}
	w.Flush()
}

var containerInspectCommand = cli.Command{
	Name:      "inspect",
	ShortName: "i",
	Usage:     "inspect container",
	Action:    containerInspectAction,
}

func containerInspectAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
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
