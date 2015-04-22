package access

import (
	"testing"

	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/controller/mock_test"
)

var (
	mockManager    = &mock_test.MockManager{}
	accessRequired = NewAccessRequired(mockManager)
)

func TestAccessControlAdminRole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"admin"},
	}

	testPath := "/containers"

	if !accessRequired.checkAccess(testAcct, testPath, "POST") {
		t.Fatalf("expected valid access for %s", testPath)
	}

	testPath = "/images"

	if !accessRequired.checkAccess(testAcct, testPath, "POST") {
		t.Fatalf("expected valid access for %s", testPath)
	}
}

func TestAccessControlContainersRORole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"containers:ro"},
	}

	testPath := "/containers"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/containers"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlContainersRWRole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"containers:rw"},
	}

	testPath := "/containers"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/containers"
	testMethod = "POST"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlImagesRORole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"images:ro"},
	}

	testPath := "/images"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/containers"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlImagesRWRole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"images:rw"},
	}

	testPath := "/containers"
	testMethod := "GET"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/containers"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}
	testPath = "/images"
	testMethod = "POST"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlRegistriesRORole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"registries:ro"},
	}

	testPath := "/api/registry"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/registry"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/containers"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlRegistriesRWRole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"registries:rw"},
	}

	testPath := "/api/registry"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/registry"
	testMethod = "POST"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "GET"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlEventsRORole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"events:ro"},
	}

	testPath := "/api/events"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/events"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/containers"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlEventsRWRole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"events:rw"},
	}

	testPath := "/api/events"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/events"
	testMethod = "POST"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/events"
	testMethod = "DELETE"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "GET"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
	testPath = "/images"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlNodesRORole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"nodes:ro"},
	}

	testPath := "/api/nodes"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/nodes"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}

	testPath = "/containers"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}

func TestAccessControlNodesRWRole(t *testing.T) {
	testAcct := &auth.Account{
		Username: "testuser",
		Roles:    []string{"nodes:rw"},
	}

	testPath := "/api/nodes"
	testMethod := "GET"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/nodes"
	testMethod = "POST"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/api/nodes"
	testMethod = "DELETE"

	if !accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected valid access for %s %s", testMethod, testPath)
	}

	testPath = "/images"
	testMethod = "GET"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
	testPath = "/images"
	testMethod = "POST"

	if accessRequired.checkAccess(testAcct, testPath, testMethod) {
		t.Fatalf("expected denied access for %s %s", testMethod, testPath)
	}
}
