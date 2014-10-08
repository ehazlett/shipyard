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
		sUrl := os.Getenv("SHIPYARD_URL")
		if sUrl == "" {
			cfg.Url = sUrl
		}
	}
	app := cli.NewApp()
	app.Name = "shipyard"
	app.Usage = "manage a shipyard cluster"
	app.Version = "2.0.1"
	app.EnableBashCompletion = true
	app.Flags = []cli.Flag{}
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
