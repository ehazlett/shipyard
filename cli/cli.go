package main

import (
	"os"

	"github.com/Sirupsen/logrus"
	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard"
)

var (
	shipyardHost string
	logger       = logrus.New()
)

func main() {
	cfg, err := loadConfig(nil)
	if err != nil {
		if err != ErrConfigDoesNotExist {
			logger.Fatal(err)
		}
	}
	if cfg != nil {
		sUrl := os.Getenv("SHIPYARD_URL")
		if sUrl == "" {
			cfg.Url = sUrl
		}
	}
	app := cli.NewApp()
	app.Name = "shipyard"
	app.Usage = "manage a shipyard cluster"
	app.Version = shipyard.VERSION
	app.EnableBashCompletion = true
	app.Flags = []cli.Flag{
		cli.BoolFlag{
			Name:  "allow-insecure",
			Usage: "allow insecure certificates if using TLS",
		},
	}
	app.Commands = []cli.Command{
		loginCommand,
		changePasswordCommand,
		accountsCommand,
		addAccountCommand,
		deleteAccountCommand,
		containersCommand,
		containerInspectCommand,
		runCommand,
		stopCommand,
		restartCommand,
		scaleCommand,
		logsCommand,
		destroyCommand,
		engineListCommand,
		engineAddCommand,
		engineRemoveCommand,
		engineInspectCommand,
		serviceKeysListCommand,
		serviceKeyCreateCommand,
		serviceKeyRemoveCommand,
		extensionsCommand,
		addExtensionCommand,
		removeExtensionCommand,
		webhookKeysListCommand,
		webhookKeyCreateCommand,
		webhookKeyRemoveCommand,
		infoCommand,
		eventsCommand,
	}
	app.Run(os.Args)
}
