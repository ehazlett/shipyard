package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/citadel/citadel"
	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard"
)

var engineListCommand = cli.Command{
	Name:   "engines",
	Usage:  "list engines",
	Action: engineListAction,
}

func engineListAction(c *cli.Context) {
	m := NewManager(c.GlobalString("host"))
	engines, err := m.Engines()
	if err != nil {
		fmt.Println("error getting engines: %s\n", err)
		return
	}
	if len(engines) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', 0)
	fmt.Fprintln(w, "ID\tCpus\tMemory\tAddr\tLabels")
	for _, e := range engines {
		labels := strings.Join(e.Engine.Labels, ",")
		fmt.Fprintf(w, "%s\t%f\t%f\t%s\t%s\n", e.Engine.ID, e.Engine.Cpus, e.Engine.Memory, e.Engine.Addr, labels)
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
	m := NewManager(c.GlobalString("host"))
	engine := &citadel.Engine{
		ID:     c.String("id"),
		Addr:   c.String("addr"),
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
			fmt.Println("unable to open ssl certificate: %s", err)
			return
		}
		sslKey, err := os.Open(sslKeyPath)
		if err != nil {
			fmt.Println("unable to open ssl key: %s", err)
			return
		}
		caCert, err := os.Open(caCertPath)
		if err != nil {
			fmt.Println("unable to open ca certificate: %s", err)
			return
		}
		if _, err := sslCert.Stat(); err != nil {
			fmt.Println("ssl cert is not accessible: %s", err)
		}
		if _, err := sslKey.Stat(); err != nil {
			fmt.Println("ssl key is not accessible: %s", err)
		}
		if _, err := caCert.Stat(); err != nil {
			fmt.Println("ca cert is not accessible: %s", err)
		}
		sslCertData, sslErr = ioutil.ReadAll(sslCert)
		if sslErr != nil {
			fmt.Println("unable to read ssl certificate: %s", sslErr)
			return
		}
		sslKeyData, sslErr = ioutil.ReadAll(sslKey)
		if sslErr != nil {
			fmt.Println("unable to read ssl key: %s", sslErr)
			return
		}
		caCertData, sslErr = ioutil.ReadAll(caCert)
		if sslErr != nil {
			fmt.Println("unable to read ca certificate: %s", sslErr)
			return
		}
	}
	shipyardEngine := &shipyard.Engine{
		SSLCertificate: string(sslCertData),
		SSLKey:         string(sslKeyData),
		CACertificate:  string(caCertData),
		Engine:         engine,
	}
	if err := m.AddEngine(shipyardEngine); err != nil {
		fmt.Printf("error adding engine: %s\n", err)
		return
	}
}
