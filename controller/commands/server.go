package commands

import (
	log "github.com/Sirupsen/logrus"
	"github.com/codegangsta/cli"
	"github.com/shipyard/shipyard/auth/builtin"
	"github.com/shipyard/shipyard/auth/ldap"
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
	ldapServer := c.String("ldap-server")
	ldapPort := c.Int("ldap-port")
	ldapBaseDn := c.String("ldap-base-dn")
	ldapAutocreateUsers := c.Bool("ldap-autocreate-users")
	ldapDefaultAccessLevel := c.String("ldap-default-access-level")

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

	// default to builtin auth
	authenticator := builtin.NewAuthenticator("defaultshipyard")

	// use ldap auth if specified
	if ldapServer != "" {
		authenticator = ldap.NewAuthenticator(ldapServer, ldapPort, ldapBaseDn, ldapAutocreateUsers, ldapDefaultAccessLevel)
	}

	controllerManager, err := manager.NewManager(rethinkdbAddr, rethinkdbDatabase, rethinkdbAuthKey, client, disableUsageInfo, authenticator)
	if err != nil {
		log.Fatal(err)
	}

	log.Debugf("connected to docker: url=%s", dockerUrl)

	shipyardTlsCert := c.String("shipyard-tls-cert")
	shipyardTlsKey := c.String("shipyard-tls-key")
	shipyardTlsCACert := c.String("shipyard-tls-ca-cert")

	apiConfig := api.ApiConfig{
		ListenAddr:         listenAddr,
		Manager:            controllerManager,
		AuthWhiteListCIDRs: authWhitelist,
		EnableCORS:         enableCors,
		AllowInsecure:      allowInsecure,
		TLSCACertPath:      shipyardTlsCACert,
		TLSCertPath:        shipyardTlsCert,
		TLSKeyPath:         shipyardTlsKey,
	}

	shipyardApi, err := api.NewApi(apiConfig)
	if err != nil {
		log.Fatal(err)
	}

	if err := shipyardApi.Run(); err != nil {
		log.Fatal(err)
	}
}
