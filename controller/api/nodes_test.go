package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/controller/mock_test"
	"github.com/stretchr/testify/assert"
)

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
