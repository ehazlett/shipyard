package main

import (
	"bytes"
	"io"
	"os"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var logsCommand = cli.Command{
	Name:        "logs",
	Usage:       "show container logs",
	Description: "logs <id> [--stdout] [--stderr]",
	Action:      logsAction,
	Flags: []cli.Flag{
		cli.BoolFlag{
			Name:  "stdout",
			Usage: "show stdout",
		},
		cli.BoolFlag{
			Name:  "stderr",
			Usage: "show stderr",
		},
	},
}

func logsAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}

	m := client.NewManager(cfg)
	ids := c.Args()
	if len(ids) == 0 {
		logger.Fatal("you must specify an id")
	}
	id := ids[0]

	container, err := m.Container(id)
	stdout := c.Bool("stdout")
	stderr := c.Bool("stderr")

	// if output not specified, use both
	if stdout == false && stderr == false {
		stdout = true
		stderr = true
	}

	data, err := m.Logs(container, stdout, stderr)
	if err != nil {
		logger.Fatalf("error reading logs: %s", err)
	}

	buf := new(bytes.Buffer)
	buf.ReadFrom(data)

	io.Copy(os.Stdout, buf)
}
