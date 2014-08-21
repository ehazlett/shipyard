package main

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"
	"time"

	"github.com/codegangsta/cli"
)

var eventsCommand = cli.Command{
	Name:   "events",
	Usage:  "show cluster events",
	Action: eventsAction,
}

func eventsAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	events, err := m.Events()
	if err != nil {
		logger.Fatalf("error getting events: %s", err)
	}
	if len(events) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "Time\tContainer\tEngine\tType\tTags")
	for _, e := range events {
		tags := strings.Join(e.Tags, ",")
		cntId := e.Container.ID[:12]
		fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\n", e.Time.Format(time.RubyDate), cntId, e.Container.Engine.ID, e.Type, tags)
	}
	w.Flush()
}
