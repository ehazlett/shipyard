package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/controller/mock_test"
	"github.com/stretchr/testify/assert"
)

func TestApiGetConsoleSession(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.consoleSession))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	cs := &shipyard.ConsoleSession{}
	if err := json.NewDecoder(res.Body).Decode(&cs); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, cs.ID, nil, "expected console session; received nil")

	assert.Equal(t, cs.ID, mock_test.TestConsoleSession.ID, fmt.Sprintf("expected ID %s; got %s", mock_test.TestConsoleSession.ID, cs.ID))
}

func TestApiPostConsoleSessions(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.createConsoleSession))
	defer ts.Close()

	data := []byte(`{"container_id": "abcdefg", "token": "12345"}`)

	res, err := http.Post(ts.URL, "application/json", bytes.NewBuffer(data))
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
}

func TestApiDeleteConsoleSession(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	ts := httptest.NewServer(http.HandlerFunc(api.removeConsoleSession))
	defer ts.Close()

	data := []byte(`{"id": "0"}`)

	req, err := http.NewRequest("DELETE", ts.URL, bytes.NewBuffer(data))
	if err != nil {
		t.Fatal(err)
	}

	res, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
}
