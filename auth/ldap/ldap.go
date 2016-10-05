package ldap

import (
	"fmt"

	log "github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/auth"
	goldap "gopkg.in/ldap.v1"
	"strings"
)

type (
	LdapAuthenticator struct {
		Server             string
		Port               int
		BaseDN             string
		DefaultAccessLevel string
		AutocreateUsers    bool
	}
)

func NewAuthenticator(server string, port int, baseDN string, autocreateUsers bool, defaultAccessLevel string) auth.Authenticator {
	log.Infof("Using LDAP authentication: server=%s port=%d basedn=%s",
		server, port, baseDN)
	return &LdapAuthenticator{
		Server:             server,
		Port:               port,
		BaseDN:             baseDN,
		AutocreateUsers:    autocreateUsers,
		DefaultAccessLevel: defaultAccessLevel,
	}
}

func (a LdapAuthenticator) Name() string {
	return "ldap"
}

func (a LdapAuthenticator) Authenticate(username, password, hash string) (bool, error) {
	log.Debugf("ldap authentication: username=%s", username)
	l, err := goldap.Dial("tcp", fmt.Sprintf("%s:%d", a.Server, a.Port))
	if err != nil {
		log.Error(err)
		return false, err
	}
	defer l.Close()

	dn := fmt.Sprintf("cn=%s,%s", username, a.BaseDN)
	if err := l.Bind(dn, password); err != nil {
		return false, err
	}
	if strings.Contains(a.BaseDN, "{username}") {
		dn = strings.Replace(a.BaseDN, "{username}", username, -1)
	}

	log.Debugf("ldap authentication: dn=%s", dn)

	log.Debugf("ldap authentication successful: username=%s", username)

	return true, nil
}

func (a LdapAuthenticator) IsUpdateSupported() bool {
	return false
}

func (a LdapAuthenticator) GenerateToken() (string, error) {
	return auth.GenerateToken()
}
