package main

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/codegangsta/cli"
)

var engineListCommand = cli.Command{
	Name:   "engines",
	Usage:  "manage engines",
	Action: engineListAction,
}

func engineListAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	engines, err := m.Engines()
	if err != nil {
		fmt.Println("error getting engines: %s\n", err)
		return
	}
	if len(engines) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "ID\tCpus\tMemory\tAddr\tLabels")
	for _, e := range engines {
		labels := strings.Join(e.Engine.Labels, ",")
		fmt.Fprintf(w, "%s\t%f\t%f\t%s\t%s\n", e.Engine.ID, e.Engine.Cpus, e.Engine.Memory, e.Engine.Addr, labels)
	}
	w.Flush()
}
