package manager

import (
	"testing"
)

func TestParseDriverStatus(t *testing.T) {
	driverStatus := [][]string{
		[]string{"\u0008Strategy", "spread"},
		[]string{"\u0008Filters", "affinity, health, constraint"},
		[]string{"\u0008Nodes", "1"},
		[]string{"localhost", "127.0.0.1:2375"},
		[]string{"remote", "1.2.3.4:2375"},
		[]string{" └ Containers", "3"},
	}

	nodes, err := parseClusterNodes(driverStatus)
	if err != nil {
		t.Fatal(err)
	}

	if len(nodes) != 2 {
		t.Fatalf("expected 2 nodes; received %d", len(nodes))
	}

	n1 := nodes[0]
	n2 := nodes[1]

	if n1.Name != "localhost" {
		t.Fatalf("expected name \"localhost\"; received \"%s\"", n1.Name)
	}

	if n1.Addr != "127.0.0.1:2375" {
		t.Fatalf("expected addr \"127.0.0.1:2375\"; received \"%s\"", n1.Addr)
	}

	if n2.Name != "remote" {
		t.Fatalf("expected name \"remote\"; received \"%s\"", n2.Name)
	}

	if n2.Addr != "1.2.3.4:2375" {
		t.Fatalf("expected addr \"1.2.3.4:2375\"; received \"%s\"", n2.Addr)
	}
}
