package manager

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/citadel/citadel"
	"github.com/shipyard/shipyard"
)

func newManager() *Manager {
	rHost := os.Getenv("RETHINKDB_TEST_PORT_28015_TCP_ADDR")
	rPort := os.Getenv("RETHINKDB_TEST_PORT_28015_TCP_PORT")
	rDb := os.Getenv("RETHINKDB_TEST_DATABASE")
	rethinkdbAddr := ""
	if rHost != "" && rPort != "" {
		rethinkdbAddr = fmt.Sprintf("%s:%s", rHost, rPort)
	}
	dockerHostAddr := os.Getenv("DOCKER_TEST_ADDR")
	if dockerHostAddr == "" || rethinkdbAddr == "" {
		fmt.Println("env vars needed: RETHINKDB_TEST_PORT_28015_TCP_ADDR, RETHINKDB_TEST_PORT_28015_TCP_PORT, RETHINKDB_TEST_DATABASE, DOCKER_TEST_ADDR")
		os.Exit(1)
	}
	m, err := NewManager(rethinkdbAddr, rDb, "")
	if err != nil {
		fmt.Printf("unable to connect to test db: %s\n", err)
		os.Exit(1)
	}
	eng := &shipyard.Engine{
		ID: "test",
		Engine: &citadel.Engine{
			ID:     "test",
			Addr:   dockerHostAddr,
			Cpus:   4.0,
			Memory: 4096,
			Labels: []string{"tests"},
		},
	}
	m.AddEngine(eng)
	return m
}

func getTestImage() *citadel.Image {
	img := &citadel.Image{
		Name:   "busybox",
		Cpus:   0.1,
		Memory: 16,
		Type:   "service",
	}
	return img
}

func TestRun(t *testing.T) {
	m := newManager()
	img := getTestImage()
	cTest, err := m.Run(img, 1, true)
	if err != nil {
		t.Error(err)
	}
	if len(cTest) != 1 {
		t.Errorf("expected 1 container; received %d", len(cTest))
	}
	c := cTest[0]
	if c.Image.Name != "busybox" {
		t.Errorf("expected image %s; received %s", img.Name, c.Image.Name)
	}
	// cleanup
	for _, c := range cTest {
		if err := m.Destroy(c); err != nil {
			t.Error(err)
		}
	}
	time.Sleep(2 * time.Second)
}

func TestScaleUp(t *testing.T) {
	m := newManager()
	img := getTestImage()
	cTest, err := m.Run(img, 1, true)
	if err != nil {
		t.Error(err)
	}

	c := cTest[0]
	if err := m.Scale(c, 2); err != nil {
		t.Error(err)
	}

	containers, err := m.IdenticalContainers(c, true)
	if err != nil {
		t.Error(err)
	}

	if len(containers) != 2 {
		t.Errorf("expected 2 containers; received %d", len(containers))
	}

	// cleanup
	for _, c := range containers {
		if err := m.Destroy(c); err != nil {
			t.Error(err)
		}
	}
	time.Sleep(2 * time.Second)
}

func TestScaleDown(t *testing.T) {
	m := newManager()
	img := getTestImage()
	cTest, err := m.Run(img, 4, true)
	if err != nil {
		t.Error(err)
	}

	if len(cTest) != 4 {
		t.Errorf("expected to run 4 containers; received %d", len(cTest))
	}

	c := cTest[0]

	if err := m.Scale(c, 1); err != nil {
		t.Error(err)
	}

	containers, err := m.IdenticalContainers(c, true)
	if err != nil {
		t.Error(err)
	}

	if len(containers) != 1 {
		t.Errorf("expected 1 container; received %d", len(containers))
	}

	// cleanup
	for _, c := range containers {
		if err := m.Destroy(c); err != nil {
			t.Error(err)
		}
	}
	time.Sleep(2 * time.Second)
}
