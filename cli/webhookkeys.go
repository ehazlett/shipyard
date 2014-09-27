package main

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/client"
)

var webhookKeysListCommand = cli.Command{
	Name:   "webhook-keys",
	Usage:  "list webhook keys",
	Action: webhookKeysListAction,
}

func webhookKeysListAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	keys, err := m.WebhookKeys()
	if err != nil {
		logger.Fatalf("error getting webhook keys: %s", err)
		return
	}
	if len(keys) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "Image\tKey")
	for _, k := range keys {
		fmt.Fprintf(w, "%s\t%s\n", k.Image, k.Key)
	}
	w.Flush()
}

var webhookKeyCreateCommand = cli.Command{
	Name:   "add-webhook-key",
	Usage:  "adds a webhook key",
	Action: webhookKeyCreateAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "image, i",
			Value: "",
			Usage: "webhook key docker image",
		},
	},
}

func webhookKeyCreateAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	key, err := m.NewWebhookKey(c.String("image"))
	if err != nil {
		logger.Fatalf("error generating webhook key: %s\n", err)
	}
	fmt.Printf("created key: %s\n", key.Key)
}

var webhookKeyRemoveCommand = cli.Command{
	Name:        "remove-webhook-key",
	Usage:       "removes a webhook key",
	Description: "remove-webhook-key <key> [<key>]",
	Action:      webhookKeyRemoveAction,
}

func webhookKeyRemoveAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	removeKeys := c.Args()
	for _, key := range removeKeys {
		if err := m.RemoveWebhookKey(key); err != nil {
			logger.Fatalf("error removing webhook key: %s", err)
		}
		fmt.Printf("removed %s\n", key)
	}
}
