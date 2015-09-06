package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shipyard/shipyard"
	"github.com/stretchr/testify/assert"
)

func TestApiGetEvents(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.events))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	events := []*shipyard.Event{}

	if err := json.NewDecoder(res.Body).Decode(&events); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, len(events), 0, "expected events; received none")
}

func TestApiPurgeEvents(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	ts := httptest.NewServer(http.HandlerFunc(api.purgeEvents))
	defer ts.Close()

	req, err := http.NewRequest("DELETE", ts.URL, nil)
	if err != nil {
		t.Fatal(err)
	}

	res, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 204, "expected response code 204")
}
