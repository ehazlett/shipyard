package auth

import (
	"errors"
	"strings"
	"time"

	"code.google.com/p/go.crypto/bcrypt"
)

var (
	ErrUnauthorized  = errors.New("unauthorized")
	ErrNoUserInToken = errors.New("no user sent in token")
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

	AccessToken struct {
		Token    string
		Username string
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

// GetAccessToken returns an AccessToken from the access header
func GetAccessToken(authToken string) (*AccessToken, error) {
	parts := strings.Split(authToken, ":")

	if len(parts) != 2 {
		return nil, ErrNoUserInToken

	}

	return &AccessToken{
		Username: parts[0],
		Token:    parts[1],
	}, nil

}
