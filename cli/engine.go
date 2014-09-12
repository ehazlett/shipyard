package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/citadel/citadel"
	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/client"
)

var engineListCommand = cli.Command{
	Name:   "engines",
	Usage:  "list engines",
	Action: engineListAction,
}

func engineListAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	engines, err := m.Engines()
	if err != nil {
		logger.Fatalf("error getting engines: %s", err)
		return
	}
	if len(engines) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "ID\tCpus\tMemory\tHost\tLabels")
	for _, e := range engines {
		labels := strings.Join(e.Engine.Labels, ",")
		fmt.Fprintf(w, "%s\t%.2f\t%.2f\t%s\t%s\n", e.Engine.ID, e.Engine.Cpus, e.Engine.Memory, e.Engine.Addr, labels)
	}
	w.Flush()
}

var engineAddCommand = cli.Command{
	Name:   "add-engine",
	Usage:  "add shipyard engine",
	Action: engineAddAction,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "id",
			Value: "",
			Usage: "engine id",
		},
		cli.StringFlag{
			Name:  "addr",
			Value: "http://127.0.0.1:2375",
			Usage: "engine address",
		},
		cli.StringFlag{
			Name:  "cpus",
			Value: "1.0",
			Usage: "engine cpus",
		},
		cli.StringFlag{
			Name:  "memory",
			Value: "1024",
			Usage: "engine memory",
		},
		cli.StringSliceFlag{
			Name:  "label",
			Value: &cli.StringSlice{},
			Usage: "engine labels",
		},
		cli.StringFlag{
			Name:  "ssl-cert",
			Value: "",
			Usage: "path to ssl certificate",
		},
		cli.StringFlag{
			Name:  "ssl-key",
			Value: "",
			Usage: "path to ssl key",
		},
		cli.StringFlag{
			Name:  "ca-cert",
			Value: "",
			Usage: "path to ca certificate",
		},
	},
}

func engineAddAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	id := c.String("id")
	addr := c.String("addr")
	if id == "" || addr == "" {
		logger.Fatalf("you must specify an id and address")
	}
	engine := &citadel.Engine{
		ID:     id,
		Addr:   addr,
		Cpus:   c.Float64("cpus"),
		Memory: c.Float64("memory"),
		Labels: c.StringSlice("label"),
	}
	sslCertPath := c.String("ssl-cert")
	sslKeyPath := c.String("ssl-key")
	caCertPath := c.String("ca-cert")
	var (
		sslCertData = []byte{}
		sslKeyData  = []byte{}
		caCertData  = []byte{}
		sslErr      error
	)
	if sslCertPath != "" && sslKeyPath != "" && caCertPath != "" {
		sslCert, err := os.Open(sslCertPath)
		if err != nil {
			logger.Fatalf("unable to open ssl certificate: %s", err)
		}
		sslKey, err := os.Open(sslKeyPath)
		if err != nil {
			logger.Fatalf("unable to open ssl key: %s", err)
		}
		caCert, err := os.Open(caCertPath)
		if err != nil {
			logger.Fatalf("unable to open ca certificate: %s", err)
		}
		if _, err := sslCert.Stat(); err != nil {
			logger.Fatalf("ssl cert is not accessible: %s", err)
		}
		if _, err := sslKey.Stat(); err != nil {
			logger.Fatalf("ssl key is not accessible: %s", err)
		}
		if _, err := caCert.Stat(); err != nil {
			logger.Fatalf("ca cert is not accessible: %s", err)
		}
		sslCertData, sslErr = ioutil.ReadAll(sslCert)
		if sslErr != nil {
			logger.Fatalf("unable to read ssl certificate: %s", sslErr)
		}
		sslKeyData, sslErr = ioutil.ReadAll(sslKey)
		if sslErr != nil {
			logger.Fatalf("unable to read ssl key: %s", sslErr)
		}
		caCertData, sslErr = ioutil.ReadAll(caCert)
		if sslErr != nil {
			logger.Fatalf("unable to read ca certificate: %s", sslErr)
		}
	}
	shipyardEngine := &shipyard.Engine{
		SSLCertificate: string(sslCertData),
		SSLKey:         string(sslKeyData),
		CACertificate:  string(caCertData),
		Engine:         engine,
	}
	if err := m.AddEngine(shipyardEngine); err != nil {
		logger.Fatalf("error adding engine: %s", err)
	}
}

var engineRemoveCommand = cli.Command{
	Name:        "remove-engine",
	Usage:       "removes an engine",
	Description: "remove-engine <id> [<id>]",
	Action:      engineRemoveAction,
}

func engineRemoveAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	engines, err := m.Engines()
	if err != nil {
		logger.Fatalf("error removing engine: %s\n", err)
	}
	removeEngines := c.Args()
	for _, eng := range engines {
		// this can probably be more efficient
		for _, i := range removeEngines {
			if eng.Engine.ID == i {
				if err := m.RemoveEngine(eng); err != nil {
					logger.Fatalf("error removing engine: %s", err)
				}
				fmt.Printf("removed %s\n", eng.Engine.ID)
			}
		}
	}
}

var engineInspectCommand = cli.Command{
	Name:        "inspect-engine",
	Usage:       "inspect an engine",
	Description: "inspect-engine <id>",
	Action:      engineInspectAction,
}

func engineInspectAction(c *cli.Context) {
	cfg, err := loadConfig()
	if err != nil {
		logger.Fatal(err)
	}
	m := client.NewManager(cfg)
	if len(c.Args()) == 0 {
		logger.Fatal("you must specify an id")
	}
	id := c.Args()[0]
	eng, err := m.GetEngine(id)
	if err != nil {
		logger.Fatalf("error inspecting engine: %s", err)
	}
	b, err := json.MarshalIndent(eng, "", "    ")
	fmt.Println(string(b))
}
