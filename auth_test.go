package shipyard

import (
	"testing"
)

const (
	TEST_PASS = "FOOPASS.+&^"
)

var (
	auth = &Authenticator{salt: nil}
)

func TestHash(t *testing.T) {
	h, err := auth.Hash(TEST_PASS)
	if err != nil {
		t.Error(err)
	}
	if len(h) == 0 {
		t.Errorf("expected a hashed password; go a zero length string")
	}
}
func TestAuthenticate(t *testing.T) {
	h, err := auth.Hash(TEST_PASS)
	if err != nil {
		t.Error(err)
	}
	if !auth.Authenticate(TEST_PASS, h) {
		t.Error("expected password FOO")
	}
	if auth.Authenticate("BADpass", h) {
		t.Error("expected passwords to not match")
	}
}

func TestAuthenticateFailIfNoPass(t *testing.T) {
	h, err := auth.Hash(TEST_PASS)
	if err != nil {
		t.Error(err)
	}
	if auth.Authenticate("", h) {
		t.Error("empty password should not match")
	}
}
