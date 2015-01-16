package main

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var infoCommand = cli.Command{
	Name:   "info",
	Usage:  "show cluster info",
	Action: infoAction,
}

func infoAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	info, err := m.Info()
	if err != nil {
		logger.Fatalf("error getting cluster info: %s", err)
	}
	cpuPercentage := 0.0
	memPercentage := 0.0
	if info.ReservedCpus > 0.0 && info.Cpus > 0.0 {
		cpuPercentage = (info.ReservedCpus / info.Cpus) * 100
	}
	if info.ReservedMemory > 0.0 && info.Memory > 0.0 {
		memPercentage = (info.ReservedMemory / info.Memory) * 100
	}

	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintf(w, "Controller Version: %s\n", info.Version)
	fmt.Fprintf(w, "Cpus: %.2f\n", info.Cpus)
	fmt.Fprintf(w, "Memory: %.2f MB\n", info.Memory)
	fmt.Fprintf(w, "Containers: %d\n", info.ContainerCount)
	fmt.Fprintf(w, "Images: %d\n", info.ImageCount)
	fmt.Fprintf(w, "Engines: %d\n", info.EngineCount)
	fmt.Fprintf(w, "Reserved Cpus: %.2f%% (%.2f)\n", cpuPercentage, info.ReservedCpus)
	fmt.Fprintf(w, "Reserved Memory: %.2f%% (%.2f MB)\n", memPercentage, info.ReservedMemory)
	w.Flush()
}
