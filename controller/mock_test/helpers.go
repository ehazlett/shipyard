package mock_test

import (
	"time"

	"github.com/samalba/dockerclient"
	"github.com/shipyard/shipyard/model"
	"github.com/shipyard/shipyard/model/dockerhub"
	registry "github.com/shipyard/shipyard/model/registry/v1"
	"github.com/shipyard/shipyard/utils/auth"
)

var (
	TestContainerId    = "1234567890abcdefg"
	TestContainerName  = "test-container"
	TestContainerImage = "test-image"
	TestRegistry       = &model.Registry{
		ID:            "0",
		Name:          "test-registry",
		Addr:          "http://localhost:5000",
		Username:      "admin",
		Password:      "admin",
		TlsSkipVerify: false,
	}
	TestRepository = &registry.Repository{
		Description: "repository",
		Name:        "Test Rep 1",
		Namespace:   "test",
	}
	TestContainerInfo = &dockerclient.ContainerInfo{
		Id:      TestContainerId,
		Created: string(time.Now().UnixNano()),
		Name:    TestContainerName,
		Image:   TestContainerImage,
	}
	TestNode = &model.Node{
		ID:   "0",
		Name: "testnode",
		Addr: "tcp://127.0.0.1:3375",
	}
	TestAccount = &auth.Account{
		ID:       "0",
		Username: "testuser",
		Password: "test",
	}
	TestEvent = &model.Event{
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
	TestConsoleSession = &model.ConsoleSession{
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

func getTestEvents() []*model.Event {
	return []*model.Event{
		TestEvent,
	}
}
