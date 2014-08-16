package main

import (
	"os"

	"github.com/codegangsta/cli"
	"github.com/sirupsen/logrus"
)

var (
	shipyardHost string
	logger       = logrus.New()
)

func main() {
	shost := os.Getenv("SHIPYARD_HOST")
	if shost == "" {
		shost = "http://127.0.0.1:8080"
	}
	app := cli.NewApp()
	app.Name = "shipyard"
	app.Usage = "manage a shipyard cluster"
	app.Version = "1.0.0"
	app.Flags = []cli.Flag{
		cli.StringFlag{
			Name:  "host",
			Value: shost,
			Usage: "shipyard host",
		},
	}
	app.Commands = []cli.Command{
		accountsCommand,
		addAccountCommand,
		deleteAccountCommand,
		containersCommand,
		containerInspectCommand,
		runCommand,
		destroyCommand,
		engineListCommand,
		engineAddCommand,
		engineRemoveCommand,
		engineInspectCommand,
		infoCommand,
		eventsCommand,
	}
	app.Run(os.Args)
}
