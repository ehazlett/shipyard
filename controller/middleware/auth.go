package middleware

import (
	"fmt"
	"net/http"

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
}

func NewAuthRequired() *AuthRequired {
	return &AuthRequired{
		deniedHostHandler: http.HandlerFunc(defaultDeniedHostHandler),
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
	authHeader := r.Header.Get("AUTH_TOKEN")
	valid := false
	// TODO: validate
	if authHeader != "" {
		valid = true
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
