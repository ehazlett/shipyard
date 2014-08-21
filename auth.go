package shipyard

import (
	"errors"

	"github.com/jameskeane/bcrypt"
)

var (
	ErrUnauthorized = errors.New("unauthorized")
)

type (
	Account struct {
		ID       string `json:"id,omitempty" gorethink:"id,omitempty"`
		Username string `json:"username,omitempty" gorethink:"username"`
		Password string `json:"-" gorethink:"password"`
	}
	Authenticator struct{}
)

func NewAuthenticator(salt string) *Authenticator {
	return &Authenticator{}
}

func (a *Authenticator) Hash(password string) (string, error) {
	return bcrypt.Hash(password)
}

func (a *Authenticator) Authenticate(password, hash string) bool {
	return bcrypt.Match(password, hash)
}
