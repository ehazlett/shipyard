package api

import (
	//	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"bytes"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/controller/mock_test"
	"github.com/stretchr/testify/assert"
)

func TestApiGetRegistries(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.registries))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	regs := []*shipyard.Registry{}
	if err := json.NewDecoder(res.Body).Decode(&regs); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, len(regs), 0, "expected accounts; received none")

	reg := regs[0]

	assert.Equal(t, reg.ID, mock_test.TestRegistry.ID, fmt.Sprintf("expected ID %s; got %s", mock_test.TestRegistry.ID, reg.ID))
}

func TestApiAddRegistry(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.addRegistry))
	defer ts.Close()

	reg := []byte(`{"name":"test-registry","addr":"http://localhost:5000","username":"admin","password":"admin"}`)

	res, err := http.Post(ts.URL, "application/json", bytes.NewBuffer(reg))
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 204, "expected response code 200")
}

func TestApiGetRegistry(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.registry))
	defer ts.Close()

	res, err := http.Get(ts.URL + "/api/registries/" + mock_test.TestRegistry.Name)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	reg := shipyard.Registry{}
	if err := json.NewDecoder(res.Body).Decode(&reg); err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, reg.ID, mock_test.TestRegistry.ID, fmt.Sprintf("expected ID %s; got %s", mock_test.TestRegistry.ID, reg.ID))
}

func TestApiRemoveRegistry(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	ts := httptest.NewServer(http.HandlerFunc(api.removeRegistry))
	defer ts.Close()

	req, err := http.NewRequest("DELETE", ts.URL+"/api/registries/"+mock_test.TestRegistry.Name, nil)
	if err != nil {
		t.Fatal(err)
	}

	res, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
}
