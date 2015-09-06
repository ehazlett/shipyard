package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/controller/mock_test"
	"github.com/stretchr/testify/assert"
)

func TestApiGetAccounts(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.accounts))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	accts := []*auth.Account{}
	if err := json.NewDecoder(res.Body).Decode(&accts); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, len(accts), 0, "expected accounts; received none")

	acct := accts[0]

	assert.Equal(t, acct.ID, mock_test.TestAccount.ID, fmt.Sprintf("expected ID %s; got %s", mock_test.TestAccount.ID, acct.ID))
}

func TestApiPostAccounts(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.saveAccount))
	defer ts.Close()

	data := []byte(`{"username": "testuser", "password": "foo"}`)

	res, err := http.Post(ts.URL, "application/json", bytes.NewBuffer(data))
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 204, "expected response code 204")
}

func TestApiDeleteAccount(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	ts := httptest.NewServer(http.HandlerFunc(api.saveAccount))
	defer ts.Close()

	data := []byte(`{"username": "testuser", "password": "foo"}`)

	req, err := http.NewRequest("DELETE", ts.URL, bytes.NewBuffer(data))
	if err != nil {
		t.Fatal(err)
	}

	res, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 204, "expected response code 204")
}
