package main

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/codegangsta/cli"
)

var infoCommand = cli.Command{
	Name:   "info",
	Usage:  "show cluster info",
	Action: infoAction,
}

func infoAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	info, err := m.Info()
	if err != nil {
		logger.Fatalf("error getting cluster info: %s", err)
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "Cpus\tMemory\tContainers\tImages\tEngines")
	fmt.Fprintf(w, "%.2f\t%.2f\t%d\t%d\t%d\n", info.Cpus, info.Memory, info.ContainerCount, info.ImageCount, info.EngineCount)
	w.Flush()
}
