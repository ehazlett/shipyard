package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/Sirupsen/logrus"
	"github.com/codegangsta/cli"
)

var (
	shipyardHost string
	logger       = logrus.New()
)

func waitForInterrupt() {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM, syscall.SIGQUIT)
	for _ = range sigChan {
		os.Exit(0)
	}
}

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
	app.Version = "2.0.6"
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
		viewCommand,
	}
	app.Run(os.Args)
}
