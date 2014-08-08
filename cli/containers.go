package main

import (
	"fmt"
	"os"
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
	fmt.Fprintln(w, "ID\tName\tHost")
	for _, c := range containers {
		fmt.Fprintf(w, fmt.Sprintf("%s\t%s\t%s\n", c.ID[:12], c.Image.Name, c.Engine.Addr))
	}
	w.Flush()
}
