package auth

import (
	"testing"
)

const (
	testPass  = "FOOPASS.+&^"
	testUser  = "admin"
	testToken = "12345"
)

func TestHash(t *testing.T) {
	h, err := Hash(testPass)
	if err != nil {
		t.Error(err)
	}

	if len(h) == 0 {
		t.Errorf("expected a hashed password; go a zero length string")
	}
}

func TestGetAccessToken(t *testing.T) {
	h := testUser + ":" + testToken
	tk, err := GetAccessToken(h)
	if err != nil {
		t.Fatal(err)

	}

	if tk.Username != testUser {
		t.Fatalf("expected username %s; received %s", testUser, tk.Username)

	}

	if tk.Token != testToken {
		t.Fatalf("expected token %s; received %s", testToken, tk.Token)

	}

}
