package commands

import (
	log "github.com/Sirupsen/logrus"
	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/controller/api"
	"github.com/shipyard/shipyard/controller/manager"
	"github.com/shipyard/shipyard/utils"
	"github.com/shipyard/shipyard/version"
)

var (
	controllerManager *manager.Manager
)

func CmdServer(c *cli.Context) {
	rethinkdbAddr := c.String("rethinkdb-addr")
	rethinkdbDatabase := c.String("rethinkdb-database")
	rethinkdbAuthKey := c.String("rethinkdb-auth-key")
	disableUsageInfo := c.Bool("disable-usage-info")
	listenAddr := c.String("listen")
	authWhitelist := c.StringSlice("auth-whitelist-cidr")
	enableCors := c.Bool("enable-cors")

	log.Infof("shipyard version %s", version.Version)

	if len(authWhitelist) > 0 {
		log.Infof("whitelisting the following subnets: %v", authWhitelist)
	}

	dockerUrl := c.String("docker")
	tlsCaCert := c.String("tls-ca-cert")
	tlsCert := c.String("tls-cert")
	tlsKey := c.String("tls-key")
	allowInsecure := c.Bool("allow-insecure")

	client, err := utils.GetClient(dockerUrl, tlsCaCert, tlsCert, tlsKey, allowInsecure)
	if err != nil {
		log.Fatal(err)
	}

	controllerManager, err := manager.NewManager(rethinkdbAddr, rethinkdbDatabase, rethinkdbAuthKey, client, disableUsageInfo)
	if err != nil {
		log.Fatal(err)
	}

	log.Debugf("connected to docker: url=%s", dockerUrl)

	shipyardApi, err := api.NewApi(listenAddr, controllerManager, authWhitelist, enableCors)
	if err != nil {
		log.Fatal(err)
	}

	if err := shipyardApi.Run(); err != nil {
		log.Fatal(err)
	}
}
