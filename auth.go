package shipyard

import (
	"errors"
	"time"

	"code.google.com/p/go.crypto/bcrypt"
)

var (
	ErrUnauthorized = errors.New("unauthorized")
)

type (
	Account struct {
		ID       string `json:"id,omitempty" gorethink:"id,omitempty"`
		Username string `json:"username,omitempty" gorethink:"username"`
		Password string `json:"password,omitempty" gorethink:"password"`
		Token    string `json:"-" gorethink:"token"`
	}
	AuthToken struct {
		Token string `json:"auth_token,omitempty"`
	}
	Authenticator struct {
		salt []byte
	}
)

func NewAuthenticator(salt string) *Authenticator {
	return &Authenticator{
		salt: []byte(salt),
	}
}

func (a *Authenticator) Hash(password string) (string, error) {
	h, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(h[:]), err
}

func (a *Authenticator) Authenticate(password, hash string) bool {
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err == nil {
		return true
	}
	return false
}

func (a *Authenticator) GenerateToken() (string, error) {
	return a.Hash(time.Now().String())
}
