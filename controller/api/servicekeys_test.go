package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shipyard/shipyard/auth"
	"github.com/stretchr/testify/assert"
)

func TestApiGetSerivceKeys(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.serviceKeys))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	keys := []*auth.ServiceKey{}

	if err := json.NewDecoder(res.Body).Decode(&keys); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, len(keys), 0, "expected keys; received none")
}

func TestApiRemoveServiceKey(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	ts := httptest.NewServer(http.HandlerFunc(api.removeServiceKey))
	defer ts.Close()

	data := []byte(`{"key": "test-key"}`)

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
