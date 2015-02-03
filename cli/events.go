package main

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"
	"time"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var eventsCommand = cli.Command{
	Name:   "events",
	Usage:  "show cluster events",
	Action: eventsAction,
}

func eventsAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	events, err := m.Events()
	if err != nil {
		logger.Fatalf("error getting events: %s", err)
	}
	if len(events) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "Time\tMessage\tEngine\tType\tTags")
	for _, e := range events {
		tags := strings.Join(e.Tags, ",")
		message := e.Message
		engine := ""
		if e.Container.ID != "" {
			cntId := e.Container.ID[:12]
			message = fmt.Sprintf("container:%s %s", cntId, e.Message)
		}
		if e.Engine.ID != "" {
			engine = e.Engine.ID
		}
		fmt.Fprintf(w, "%s\t%s\t%s\t%s\t%s\n", e.Time.Format(time.RubyDate), message, engine, e.Type, tags)
	}
	w.Flush()
}
