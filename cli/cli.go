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
	cfg, err := loadConfig()
	if err != nil {
		if err != ErrConfigDoesNotExist {
			logger.Fatal(err)
		}
	}
	if cfg != nil {
		shost := os.Getenv("SHIPYARD_HOST")
		if shost == "" {
			cfg.Host = shost
		}
	}
	app := cli.NewApp()
	app.Name = "shipyard"
	app.Usage = "manage a shipyard cluster"
	app.Version = "1.0.0"
	app.Flags = []cli.Flag{}
	app.Commands = []cli.Command{
		loginCommand,
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
