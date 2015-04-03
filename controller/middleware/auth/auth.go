package auth

import (
	"fmt"
	"net"
	"net/http"
	"strings"

	"github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/controller/manager"
)

var (
	logger = logrus.New()
)

func defaultDeniedHostHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "unauthorized", http.StatusUnauthorized)
}

type AuthRequired struct {
	deniedHostHandler http.Handler
	manager           manager.Manager
	whitelistCIDRs    []string
}

func NewAuthRequired(m manager.Manager, whitelistCIDRs []string) *AuthRequired {
	return &AuthRequired{
		deniedHostHandler: http.HandlerFunc(defaultDeniedHostHandler),
		manager:           m,
		whitelistCIDRs:    whitelistCIDRs,
	}
}

func (a *AuthRequired) Handler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := a.handleRequest(w, r)
		if err != nil {
			logger.Warnf("unauthorized request for %s from %s", r.URL.Path, r.RemoteAddr)
			return
		}
		h.ServeHTTP(w, r)
	})
}

func (a *AuthRequired) isWhitelisted(addr string) (bool, error) {
	parts := strings.Split(addr, ":")
	src := parts[0]

	srcIp := net.ParseIP(src)

	// check each whitelisted ip
	for _, c := range a.whitelistCIDRs {
		_, ipNet, err := net.ParseCIDR(c)
		if err != nil {
			return false, err
		}

		if ipNet.Contains(srcIp) {
			return true, nil
		}
	}

	return false, nil
}

func (a *AuthRequired) handleRequest(w http.ResponseWriter, r *http.Request) error {
	whitelisted, err := a.isWhitelisted(r.RemoteAddr)
	if err != nil {
		return err
	}

	if whitelisted {
		return nil
	}

	valid := false
	// service key takes priority
	serviceKey := r.Header.Get("X-Service-Key")
	if serviceKey != "" {
		if err := a.manager.VerifyServiceKey(serviceKey); err == nil {
			valid = true
		}
	} else { // check for authHeader
		authHeader := r.Header.Get("X-Access-Token")
		parts := strings.Split(authHeader, ":")
		if len(parts) == 2 {
			// validate
			user := parts[0]
			token := parts[1]
			if err := a.manager.VerifyAuthToken(user, token); err == nil {
				valid = true
				// set current user
				session, _ := a.manager.Store().Get(r, a.manager.StoreKey())
				session.Values["username"] = user
				session.Save(r, w)
			}
		}
	}

	if !valid {
		a.deniedHostHandler.ServeHTTP(w, r)
		return fmt.Errorf("unauthorized %s", r.RemoteAddr)
	}

	return nil
}

func (a *AuthRequired) HandlerFuncWithNext(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	err := a.handleRequest(w, r)

	if err != nil {
		logger.Warnf("unauthorized request for %s from %s", r.URL.Path, r.RemoteAddr)
		return
	}

	if next != nil {
		next(w, r)
	}
}
