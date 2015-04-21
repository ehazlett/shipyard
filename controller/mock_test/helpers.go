package mock_test

import (
	"time"

	"github.com/samalba/dockerclient"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/dockerhub"
	registry "github.com/shipyard/shipyard/registry/v1"
)

var (
	TestContainerId    = "1234567890abcdefg"
	TestContainerName  = "test-container"
	TestContainerImage = "test-image"
	TestRegistry       = &shipyard.Registry{
		ID:   "0",
		Name: "test-registry",
		Addr: "http://localhost:5000",
	}
	TestRepository    = &registry.Repository{}
	TestContainerInfo = &dockerclient.ContainerInfo{
		Id:      TestContainerId,
		Created: string(time.Now().UnixNano()),
		Name:    TestContainerName,
		Image:   TestContainerImage,
	}
	TestNode = &shipyard.Node{
		ID:   "0",
		Name: "testnode",
		Addr: "tcp://127.0.0.1:3375",
	}
	TestAccount = &auth.Account{
		ID:       "0",
		Username: "testuser",
		Password: "test",
	}
	TestEvent = &shipyard.Event{
		Type:          "test-event",
		ContainerInfo: TestContainerInfo,
		Message:       "test message",
		Tags:          []string{"test-tag"},
	}
	TestServiceKey = &auth.ServiceKey{
		Key:         "test-key",
		Description: "Test Key",
	}
	TestWebhookKey = &dockerhub.WebhookKey{
		ID:    "1234",
		Image: "ehazlett/test",
		Key:   "abcdefg",
	}
	TestConsoleSession = &shipyard.ConsoleSession{
		ID:          "0",
		ContainerID: "abcdefg",
		Token:       "1234567890",
	}
)

func getTestContainerInfo(id string, name string, image string) *dockerclient.ContainerInfo {
	return &dockerclient.ContainerInfo{
		Id:      id,
		Created: string(time.Now().UnixNano()),
		Name:    name,
		Image:   image,
	}
}

func getTestContainers() []*dockerclient.ContainerInfo {
	return []*dockerclient.ContainerInfo{
		getTestContainerInfo(TestContainerId, TestContainerName, TestContainerImage),
	}
}

func getTestEvents() []*shipyard.Event {
	return []*shipyard.Event{
		TestEvent,
	}
}
