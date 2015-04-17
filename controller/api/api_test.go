package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	log "github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/controller/mock_test"
	"github.com/shipyard/shipyard/dockerhub"
	"github.com/stretchr/testify/assert"
)

func getTestApi() (*Api, error) {
	log.SetLevel(log.ErrorLevel)
	m := mock_test.MockManager{}
	return NewApi("", m, nil, false)
}

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

	ts := httptest.NewServer(http.HandlerFunc(api.addAccount))
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

	ts := httptest.NewServer(http.HandlerFunc(api.addAccount))
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

func TestApiGetRoles(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.roles))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	roles := []*auth.Role{}
	if err := json.NewDecoder(res.Body).Decode(&roles); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, len(roles), 0, "expected roles; received none")

	role := roles[0]

	assert.Equal(t, role.ID, mock_test.TestRole.ID, fmt.Sprintf("expected ID %s; got %s", mock_test.TestRole.ID, role.ID))
}

func TestApiGetRole(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.role))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	role := &auth.Role{}
	if err := json.NewDecoder(res.Body).Decode(&role); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, role.ID, nil, "expected role; received nil")

	assert.Equal(t, role.ID, mock_test.TestRole.ID, fmt.Sprintf("expected ID %s; got %s", mock_test.TestRole.ID, role.ID))
}

func TestApiPostRoles(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.addRole))
	defer ts.Close()

	data := []byte(`{"name": "testrole"}`)

	res, err := http.Post(ts.URL, "application/json", bytes.NewBuffer(data))
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 204, "expected response code 204")
}

func TestApiDeleteRole(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	ts := httptest.NewServer(http.HandlerFunc(api.addAccount))
	defer ts.Close()

	data := []byte(`{"name": "testrole"}`)

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

func TestApiGetWebhookKeys(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.webhookKeys))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	keys := []*dockerhub.WebhookKey{}

	if err := json.NewDecoder(res.Body).Decode(&keys); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, len(keys), 0, "expected keys; received none")

	key := "abcdefg"

	assert.Equal(t, keys[0].Key, key, "expected key %s; received %s", key, keys[0].Key)
}

func TestApiGetNodes(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.nodes))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	nodes := []*shipyard.Node{}
	if err := json.NewDecoder(res.Body).Decode(&nodes); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, len(nodes), 0, "expected nodes; received none")

	node := nodes[0]

	assert.Equal(t, node.Name, mock_test.TestNode.Name, fmt.Sprintf("expected name %s; got %s", mock_test.TestNode.Name, node.Name))
}

func TestApiGetNode(t *testing.T) {
	api, err := getTestApi()
	if err != nil {
		t.Fatal(err)
	}

	ts := httptest.NewServer(http.HandlerFunc(api.node))
	defer ts.Close()

	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, res.StatusCode, 200, "expected response code 200")
	node := &shipyard.Node{}
	if err := json.NewDecoder(res.Body).Decode(&node); err != nil {
		t.Fatal(err)
	}

	assert.NotEqual(t, node.ID, nil, "expected node; received nil")

	assert.Equal(t, node.Name, mock_test.TestNode.Name, fmt.Sprintf("expected name %s; got %s", mock_test.TestNode.Name, node.Name))
}

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
