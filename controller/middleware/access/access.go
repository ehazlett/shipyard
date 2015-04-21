package access

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/controller/manager"
)

var (
	logger = logrus.New()
)

func defaultDeniedHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "access denied", http.StatusForbidden)
}

type AccessRequired struct {
	deniedHandler http.Handler
	manager       manager.Manager
	acls          []*auth.ACL
}

func NewAccessRequired(m manager.Manager) *AccessRequired {
	acls := auth.DefaultACLs()
	a := &AccessRequired{
		deniedHandler: http.HandlerFunc(defaultDeniedHandler),
		manager:       m,
		acls:          acls,
	}
	return a
}

func (a *AccessRequired) Handler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := a.handleRequest(w, r)
		if err != nil {
			logger.Warnf("unauthorized request for %s from %s", r.URL.Path, r.RemoteAddr)
			return
		}
		h.ServeHTTP(w, r)
	})
}

func (a *AccessRequired) handleRequest(w http.ResponseWriter, r *http.Request) error {
	valid := false
	authHeader := r.Header.Get("X-Access-Token")
	parts := strings.Split(authHeader, ":")
	if len(parts) == 2 {
		// validate
		u := parts[0]
		token := parts[1]
		if err := a.manager.VerifyAuthToken(u, token); err == nil {
			acct, err := a.manager.Account(u)
			if err != nil {
				return err
			}
			// check role
			valid = a.checkAccess(acct, r.URL.Path, r.Method)
		}
	} else { // only check access for users; not service keys
		valid = true
	}

	if !valid {
		a.deniedHandler.ServeHTTP(w, r)
		return fmt.Errorf("access denied %s", r.RemoteAddr)
	}

	return nil
}

func (a *AccessRequired) checkRule(rule *auth.AccessRule, path, method string) bool {
	// check wildcard
	if rule.Path == "*" {
		return true
	}

	// check path
	if strings.HasPrefix(path, rule.Path) {
		// check method
		for _, m := range rule.Methods {
			if m == method {
				return true
			}
		}
	}

	return false
}

func (a *AccessRequired) checkRole(role string, path, method string) bool {
	for _, acl := range a.acls {
		// find role
		if acl.RoleName == role {
			for _, rule := range acl.Rules {
				if a.checkRule(rule, path, method) {
					return true
				}
			}
		}
	}

	return false
}
func (a *AccessRequired) checkAccess(acct *auth.Account, path string, method string) bool {
	// check roles
	for _, role := range acct.Roles {
		// check acls
		if a.checkRole(role, path, method) {
			return true
		}
	}

	return false
}

func (a *AccessRequired) HandlerFuncWithNext(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	err := a.handleRequest(w, r)
	session, _ := a.manager.Store().Get(r, a.manager.StoreKey())
	username := session.Values["username"]
	if err != nil {
		logger.Warnf("access denied for %s to %s from %s", username, r.URL.Path, r.RemoteAddr)
		return
	}

	if next != nil {
		next(w, r)
	}
}
