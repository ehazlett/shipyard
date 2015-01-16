package main

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/client"
)

var serviceKeysListCommand = cli.Command{
	Name:   "service-keys",
	Usage:  "list service keys",
	Action: serviceKeysListAction,
}

func serviceKeysListAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	keys, err := m.ServiceKeys()
	if err != nil {
		logger.Fatalf("error getting service keys: %s", err)
		return
	}
	if len(keys) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "Key\tDescription")
	for _, k := range keys {
		fmt.Fprintf(w, "%s\t%s\n", k.Key, k.Description)
	}
	w.Flush()
}

var serviceKeyCreateCommand = cli.Command{
	Name:   "add-service-key",
	Usage:  "adds a service key",
	Action: serviceKeyCreateAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "description, d",
			Value: "",
			Usage: "service key description",
		},
	},
}

func serviceKeyCreateAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	key, err := m.NewServiceKey(c.String("description"))
	if err != nil {
		logger.Fatalf("error generating service key: %s\n", err)
	}
	fmt.Printf("created key: %s\n", key.Key)
}

var serviceKeyRemoveCommand = cli.Command{
	Name:        "remove-service-key",
	Usage:       "removes a service key",
	Description: "remove-service-key <key> [<key>]",
	Action:      serviceKeyRemoveAction,
}

func serviceKeyRemoveAction(c *cli.Context) {
	cfg, err := loadConfig(c)
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	removeKeys := c.Args()
	for _, key := range removeKeys {
		k := &shipyard.ServiceKey{
			Key: key,
		}
		if err := m.RemoveServiceKey(k); err != nil {
			logger.Fatalf("error removing service key: %s", err)
		}
		fmt.Printf("removed %s\n", key)
	}
}
