package main

import (
	"os"

	log "github.com/Sirupsen/logrus"
	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/controller/commands"
	"github.com/shipyard/shipyard/version"
)

const (
	STORE_KEY = "shipyard"
)

func main() {
	app := cli.NewApp()
	app.Name = "shipyard"
	app.Usage = "composable docker management"
	app.Version = version.Version + " (" + version.GitCommit + ")"
	app.Author = ""
	app.Email = ""
	app.Before = func(c *cli.Context) error {
		if c.GlobalBool("debug") {
			log.SetLevel(log.DebugLevel)
		}
		return nil
	}
	app.Commands = []cli.Command{
		{
			Name:   "server",
			Usage:  "run shipyard controller",
			Action: commands.CmdServer,
			Flags: []cli.Flag{
				cli.StringFlag{
					Name:  "listen, l",
					Usage: "listen address",
					Value: ":8080",
				},
				cli.StringFlag{
					Name:  "rethinkdb-addr",
					Usage: "RethinkDB address",
					Value: "rethinkdb:28015",
				},
				cli.StringFlag{
					Name:  "rethinkdb-auth-key",
					Usage: "RethinkDB auth key",
					Value: "",
				},
				cli.StringFlag{
					Name:  "rethinkdb-database",
					Usage: "RethinkDB database name",
					Value: "shipyard",
				},
				cli.BoolFlag{
					Name:  "disable-usage-info",
					Usage: "disable anonymous usage reporting",
				},
				cli.StringFlag{
					Name:   "docker, d",
					Value:  "tcp://127.0.0.1:2375",
					Usage:  "docker swarm addr",
					EnvVar: "DOCKER_HOST",
				},
				cli.StringFlag{
					Name:  "tls-ca-cert",
					Value: "",
					Usage: "tls ca certificate",
				},
				cli.StringFlag{
					Name:  "tls-cert",
					Value: "",
					Usage: "tls certificate",
				},
				cli.StringFlag{
					Name:  "tls-key",
					Value: "",
					Usage: "tls key",
				},
				cli.StringFlag{
					Name:  "shipyard-tls-ca-cert",
					Usage: "Shipyard TLS CA Cert",
					Value: "",
				},
				cli.StringFlag{
					Name:  "shipyard-tls-cert",
					Usage: "Shipyard TLS Cert",
					Value: "",
				},
				cli.StringFlag{
					Name:  "shipyard-tls-key",
					Usage: "Shipyard TLS Key",
					Value: "",
				},
				cli.BoolFlag{
					Name:  "allow-insecure",
					Usage: "enable insecure tls communication",
				},
				cli.BoolFlag{
					Name:  "enable-cors",
					Usage: "enable cors with swarm",
				},
				cli.StringFlag{
					Name:  "ldap-server",
					Usage: "LDAP server address",
				},
				cli.IntFlag{
					Name:  "ldap-port",
					Usage: "LDAP server port",
					Value: 389,
				},
				cli.StringFlag{
					Name:  "ldap-base-dn",
					Usage: "LDAP server base DN",
				},
				cli.BoolFlag{
					Name:  "ldap-autocreate-users",
					Usage: "Automatically create a corresponding Shipyard account if missing upon authenticating",
				},
				cli.StringFlag{
					Name:  "ldap-default-access-level",
					Usage: "Default access level for auto-created accounts (default: container read-only)",
					Value: "containers:ro",
				},
				cli.StringSliceFlag{
					Name:  "auth-whitelist-cidr",
					Usage: "whitelist CIDR to bypass auth",
					Value: &cli.StringSlice{},
				},
			},
		},
	}
	app.Flags = []cli.Flag{
		cli.BoolFlag{
			Name:  "debug, D",
			Usage: "enable debug",
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
