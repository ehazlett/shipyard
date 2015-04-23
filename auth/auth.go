package auth

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
		ID        string       `json:"id,omitempty" gorethink:"id,omitempty"`
		FirstName string       `json:"first_name,omitempty" gorethink:"first_name,omitempty"`
		LastName  string       `json:"last_name,omitempty" gorethink:"last_name,omitempty"`
		Username  string       `json:"username,omitempty" gorethink:"username"`
		Password  string       `json:"password,omitempty" gorethink:"password"`
		Tokens    []*AuthToken `json:"-" gorethink:"tokens"`
		Roles     []string     `json:"roles,omitempty" gorethink:"roles"`
	}

	AuthToken struct {
		Token     string `json:"auth_token,omitempty" gorethink:"auth_token"`
		UserAgent string `json:"user_agent,omitempty" gorethink:"user_agent"`
	}

	ServiceKey struct {
		Key         string `json:"key,omitempty" gorethink:"key"`
		Description string `json:"description,omitempty" gorethink:"description"`
	}

	Authenticator interface {
		Authenticate(username, password, hash string) (bool, error)
		GenerateToken() (string, error)
		IsUpdateSupported() bool
		Name() string
	}
)

func Hash(data string) (string, error) {
	h, err := bcrypt.GenerateFromPassword([]byte(data), bcrypt.DefaultCost)
	return string(h[:]), err
}

func GenerateToken() (string, error) {
	return Hash(time.Now().String())
}
