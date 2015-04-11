package mock_test

import (
	"github.com/gorilla/sessions"
	"github.com/samalba/dockerclient"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/dockerhub"
	registry "github.com/shipyard/shipyard/registry/v1"
)

type MockManager struct{}

func (m MockManager) Container(id string) (*dockerclient.ContainerInfo, error) {
	return getTestContainerInfo(TestContainerId, TestContainerName, TestContainerImage), nil
}

func (m MockManager) DockerClient() *dockerclient.DockerClient {
	return nil
}

func (m MockManager) SaveServiceKey(key *auth.ServiceKey) error {
	return nil
}

func (m MockManager) RemoveServiceKey(key string) error {
	return nil
}

func (m MockManager) SaveEvent(event *shipyard.Event) error {
	return nil
}

func (m MockManager) Events(limit int) ([]*shipyard.Event, error) {
	return getTestEvents(), nil
}

func (m MockManager) PurgeEvents() error {
	return nil
}

func (m MockManager) ServiceKey(key string) (*auth.ServiceKey, error) {
	return TestServiceKey, nil
}

func (m MockManager) ServiceKeys() ([]*auth.ServiceKey, error) {
	return []*auth.ServiceKey{
		TestServiceKey,
	}, nil
}

func (m MockManager) Accounts() ([]*auth.Account, error) {
	return []*auth.Account{
		TestAccount,
	}, nil
}

func (m MockManager) Account(username string) (*auth.Account, error) {
	return nil, nil
}

func (m MockManager) SaveAccount(account *auth.Account) error {
	return nil
}

func (m MockManager) DeleteAccount(account *auth.Account) error {
	return nil
}

func (m MockManager) Roles() ([]*auth.Role, error) {
	return []*auth.Role{
		TestRole,
	}, nil
}

func (m MockManager) Role(name string) (*auth.Role, error) {
	return &auth.Role{
		ID:   "0",
		Name: name,
	}, nil
}

func (m MockManager) SaveRole(role *auth.Role) error {
	return nil
}

func (m MockManager) DeleteRole(role *auth.Role) error {
	return nil
}

func (m MockManager) Authenticate(username, password string) bool {
	return false
}

func (m MockManager) NewAuthToken(username, userAgent string) (*auth.AuthToken, error) {
	return nil, nil
}

func (m MockManager) VerifyAuthToken(username, token string) error {
	return nil
}

func (m MockManager) VerifyServiceKey(key string) error {
	return nil
}

func (m MockManager) NewServiceKey(description string) (*auth.ServiceKey, error) {
	return nil, nil
}

func (m MockManager) ChangePassword(username, password string) error {
	return nil
}

func (m MockManager) WebhookKeys() ([]*dockerhub.WebhookKey, error) {
	return []*dockerhub.WebhookKey{
		TestWebhookKey,
	}, nil
}

func (m MockManager) NewWebhookKey(image string) (*dockerhub.WebhookKey, error) {
	return nil, nil
}

func (m MockManager) WebhookKey(key string) (*dockerhub.WebhookKey, error) {
	return nil, nil
}

func (m MockManager) SaveWebhookKey(key *dockerhub.WebhookKey) error {
	return nil
}

func (m MockManager) DeleteWebhookKey(id string) error {
	return nil
}

func (m MockManager) Store() *sessions.CookieStore {
	return nil
}

func (m MockManager) StoreKey() string {
	return ""
}

func (m MockManager) AddRegistry(registry *shipyard.Registry) error {
	return nil
}

func (m MockManager) Registries() ([]*shipyard.Registry, error) {
	return []*shipyard.Registry{
		TestRegistry,
	}, nil
}

func (m MockManager) Registry(name string) (*shipyard.Registry, error) {
	return TestRegistry, nil
}

func (m MockManager) RemoveRegistry(registry *shipyard.Registry) error {
	return nil
}

func (m MockManager) Nodes() ([]*shipyard.Node, error) {
	return []*shipyard.Node{
		TestNode,
	}, nil
}

func (m MockManager) Repositories() ([]*registry.Repository, error) {
	return []*registry.Repository{
		TestRepository,
	}, nil
}

func (m MockManager) Repository(name string) (*registry.Repository, error) {
	return TestRepository, nil
}

func (m MockManager) DeleteRepository(name string) error {
	return nil
}

func (m MockManager) Node(name string) (*shipyard.Node, error) {
	return TestNode, nil
}
