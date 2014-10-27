package access

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard"
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
	manager       *manager.Manager
	acl           map[string][]string
}

func defaultAccessLevels() map[string][]string {
	acl := make(map[string][]string)
	acl["admin"] = []string{"*"}
	acl["user"] = []string{
		"/api/containers",
		"/api/cluster/info",
		"/api/events",
		"/api/engines",
	}
	return acl
}

func NewAccessRequired(m *manager.Manager) *AccessRequired {
	acl := defaultAccessLevels()
	a := &AccessRequired{
		deniedHandler: http.HandlerFunc(defaultDeniedHandler),
		manager:       m,
		acl:           acl,
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
			role := acct.Role
			// check role
			valid = a.checkAccess(r.URL.Path, role)
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

func (a *AccessRequired) checkAccess(path string, role *shipyard.Role) bool {
	valid := false
	for _, v := range a.acl[role.Name] {
		if v == "*" || strings.HasPrefix(path, v) {
			valid = true
			break
		}
	}
	return valid
}

func (a *AccessRequired) HandlerFuncWithNext(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	err := a.handleRequest(w, r)
	session, _ := a.manager.Store().Get(r, a.manager.StoreKey)
	username := session.Values["username"]
	if err != nil {
		logger.Warnf("access denied for %s to %s from %s", username, r.URL.Path, r.RemoteAddr)
		return
	}

	if next != nil {
		next(w, r)
	}
}
