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
	m := NewManager()
	info, err := m.Info()
	if err != nil {
		logger.Fatalf("error getting cluster info: %s", err)
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintf(w, "Cpus: %.2f\n", info.Cpus)
	fmt.Fprintf(w, "Memory: %.2f MB\n", info.Memory)
	fmt.Fprintf(w, "Containers: %d\n", info.ContainerCount)
	fmt.Fprintf(w, "Images: %d\n", info.ImageCount)
	fmt.Fprintf(w, "Engines: %d\n", info.EngineCount)
	fmt.Fprintf(w, "Reserved Cpus: %.2f\n", info.ReservedCpus)
	fmt.Fprintf(w, "Reserved Memory: %.2f\n", info.ReservedMemory)
	w.Flush()
}
