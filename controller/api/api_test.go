package api

import (
	log "github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/controller/manager"
	"github.com/shipyard/shipyard/controller/mock_test"
	"github.com/shipyard/shipyard/utils"
	"github.com/shipyard/shipyard/utils/auth/builtin"
	"github.com/shipyard/shipyard/utils/auth/ldap"
	"github.com/shipyard/shipyard/version"
	"net/http"
)

// For mock API testing
func getTestApi() (*Api, error) {
	log.SetLevel(log.ErrorLevel)
	m := mock_test.MockManager{}
	config := ApiConfig{
		ListenAddr:         "",
		Manager:            m,
		AuthWhiteListCIDRs: nil,
		EnableCORS:         false,
		AllowInsecure:      true,
		TLSCertPath:        "",
		TLSKeyPath:         "",
	}

	return NewApi(config)
}

// Shipyard configuration struct for testing purposes
type ShipyardServerConfig struct {
	RethinkdbAddr          string
	RethinkdbAuthKey       string
	RethinkdbDatabase      string
	DisableUsageInfo       bool
	ListenAddr             string
	AuthWhitelist          []string
	EnableCors             bool
	LdapServer             string
	LdapPort               int
	LdapBaseDn             string
	LdapAutocreateUsers    bool
	LdapDefaultAccessLevel string
	DockerUrl              string
	TlsCaCert              string
	TlsCert                string
	TlsKey                 string
	AllowInsecure          bool
	ShipyardTlsCert        string
	ShipyardTlsKey         string
	ShipyardTlsCACert      string
}

// For e2e testing:
// Utility function that instantiates a real Api with a real Manager
// that will be used for e2e testing (no mocks!)
func InitServer(config *ShipyardServerConfig) (*Api, *http.ServeMux, error) {

	// TODO: create a configuration for the test suite
	if config == nil {
		panic("config for shipyard server is not valid")
	}

	log.Infof("shipyard version %s", version.Version)

	if len(config.AuthWhitelist) > 0 {
		log.Infof("whitelisting the following subnets: %v", config.AuthWhitelist)
	}

	client, err := utils.GetClient(config.DockerUrl, config.TlsCaCert, config.TlsCert, config.TlsKey, config.AllowInsecure)
	if err != nil {
		log.Fatal(err)
	}

	// default to builtin auth
	authenticator := builtin.NewAuthenticator("defaultshipyard")

	// use ldap auth if specified
	if config.LdapServer != "" {
		authenticator = ldap.NewAuthenticator(config.LdapServer, config.LdapPort, config.LdapBaseDn, config.LdapAutocreateUsers, config.LdapDefaultAccessLevel)
	}

	controllerManager, err := manager.NewManager(config.RethinkdbAddr, config.RethinkdbDatabase, config.RethinkdbAuthKey, client, config.DisableUsageInfo, authenticator)
	if err != nil {
		log.Fatal(err)
	}

	log.Debugf("connected to docker: url=%s", config.DockerUrl)

	apiConfig := ApiConfig{
		ListenAddr:         config.ListenAddr,
		Manager:            controllerManager,
		AuthWhiteListCIDRs: config.AuthWhitelist,
		EnableCORS:         config.EnableCors,
		AllowInsecure:      config.AllowInsecure,
		TLSCACertPath:      config.ShipyardTlsCACert,
		TLSCertPath:        config.ShipyardTlsCert,
		TLSKeyPath:         config.ShipyardTlsKey,
	}

	shipyardApi, err := NewApi(apiConfig)
	if err != nil {
		log.Fatal(err)
	}

	shipyardRouter, err := shipyardApi.Setup()
	if err != nil {
		log.Fatal(err)
	}

	return shipyardApi, shipyardRouter, nil
}
