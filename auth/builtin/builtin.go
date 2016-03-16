package builtin

import (
	"github.com/shipyard/shipyard/auth"
	"golang.org/x/crypto/bcrypt"
)

type (
	BuiltinAuthenticator struct {
		salt []byte
	}
)

func NewAuthenticator(salt string) auth.Authenticator {
	return &BuiltinAuthenticator{
		salt: []byte(salt),
	}
}

func (a BuiltinAuthenticator) IsUpdateSupported() bool {
	return true
}

func (a BuiltinAuthenticator) Name() string {
	return "builtin"
}

func (a BuiltinAuthenticator) Authenticate(username, password, hash string) (bool, error) {
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)); err == nil {
		return true, nil
	}
	return false, nil
}

func (a BuiltinAuthenticator) GenerateToken() (string, error) {
	return auth.GenerateToken()
}
