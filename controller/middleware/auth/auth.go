package auth

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/shipyard/shipyard/controller/manager"
	"github.com/sirupsen/logrus"
)

var (
	logger = logrus.New()
)

func defaultDeniedHostHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "unauthorized", http.StatusUnauthorized)
}

type AuthRequired struct {
	deniedHostHandler http.Handler
	manager           *manager.Manager
}

func NewAuthRequired(m *manager.Manager) *AuthRequired {
	return &AuthRequired{
		deniedHostHandler: http.HandlerFunc(defaultDeniedHostHandler),
		manager:           m,
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

func (a *AuthRequired) handleRequest(w http.ResponseWriter, r *http.Request) error {
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
				session, _ := a.manager.Store().Get(r, a.manager.StoreKey)
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
