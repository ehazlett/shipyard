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

	app := cli.NewApp()
	app.Name = "shipyard"
	app.Usage = "manage a shipyard cluster"
	app.Version = "0.0.1"
	app.Flags = []cli.Flag{
		cli.StringFlag{
			Name:  "host",
			Value: "http://127.0.0.1:8080",
			Usage: "shipyard host",
		},
	}
	app.Commands = []cli.Command{
		containersCommand,
		runCommand,
		destroyCommand,
		engineListCommand,
	}
	app.Run(os.Args)
}
