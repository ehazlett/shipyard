package mock_test

import (
	"github.com/gorilla/sessions"
	"github.com/samalba/dockerclient"
	"github.com/shipyard/shipyard/controller/manager"
	"github.com/shipyard/shipyard/model"
	"github.com/shipyard/shipyard/model/dockerhub"
	registry "github.com/shipyard/shipyard/model/registry/v1"
	"github.com/shipyard/shipyard/utils/auth"
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

func (m MockManager) SaveEvent(event *model.Event) error {
	return nil
}

func (m MockManager) Events(limit int) ([]*model.Event, error) {
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

//end Project struct
func (m MockManager) Roles() ([]*auth.ACL, error) {
	return auth.DefaultACLs(), nil
}

func (m MockManager) Role(name string) (*auth.ACL, error) {
	roles, err := m.Roles()
	return roles[0], err
}

func (m MockManager) Authenticate(username, password string) (bool, error) {
	return false, nil
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

func (m MockManager) AddRegistry(registry *model.Registry) error {
	return nil
}

func (m MockManager) Registries() ([]*model.Registry, error) {
	return []*model.Registry{
		TestRegistry,
	}, nil
}

func (m MockManager) Registry(name string) (*model.Registry, error) {
	return TestRegistry, nil
}

func (m MockManager) RegistryByAddress(addr string) (*model.Registry, error) {
	return TestRegistry, nil
}

func (m MockManager) RemoveRegistry(registry *model.Registry) error {
	return nil
}

func (m MockManager) Nodes() ([]*model.Node, error) {
	return []*model.Node{
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

func (m MockManager) Node(name string) (*model.Node, error) {
	return TestNode, nil
}

func (m MockManager) CreateConsoleSession(c *model.ConsoleSession) error {
	return nil
}

func (m MockManager) RemoveConsoleSession(c *model.ConsoleSession) error {
	return nil
}

func (m MockManager) ConsoleSession(token string) (*model.ConsoleSession, error) {
	return TestConsoleSession, nil
}

func (m MockManager) ValidateConsoleSessionToken(containerId, token string) bool {
	return true
}

func (m MockManager) GetAuthenticator() auth.Authenticator {
	return nil
}

func (m MockManager) ScaleContainer(id string, numInstances int) manager.ScaleResult {
	return manager.ScaleResult{Scaled: []string{"9c3c7dd2199a95cce29950b612ecf918ae278a42e53e10f6cccb752b6fbcd8b3"}, Errors: []string{"500 Internal Server Error: no resources available to schedule container"}}
}

// TODO: add mock objects for Projects and Images (ILM) to helpers.go
func (m MockManager) Projects() ([]*model.Project, error) {
	return nil, nil
}

func (m MockManager) Project(name string) (*model.Project, error) {
	return nil, nil
}

func (m MockManager) SaveProject(project *model.Project) error {
	return nil
}

func (m MockManager) UpdateProject(project *model.Project) error {
	return nil
}

func (m MockManager) DeleteProject(project *model.Project) error {
	return nil
}

func (m MockManager) Images() ([]*model.Image, error) {
	return nil, nil
}

func (m MockManager) ImagesByProjectId(projectId string) ([]*model.Image, error) {
	return nil, nil
}

func (m MockManager) Image(name string) (*model.Image, error) {
	return nil, nil
}

func (m MockManager) SaveImage(image *model.Image) error {
	return nil
}

func (m MockManager) UpdateImage(image *model.Image) error {
	return nil
}

func (m MockManager) DeleteImage(image *model.Image) error {
	return nil
}

func (m MockManager) DeleteAllProjects() error {
	return nil
}

func (m MockManager) DeleteAllImages() error {
	return nil
}

func (m MockManager) GetTest(projectId, testId string) (*model.Test, error) { return nil, nil }
func (m MockManager) GetTests(projectId string) ([]*model.Test, error)      { return nil, nil }
func (m MockManager) CreateTest(projectId string, test *model.Test) error   { return nil }
func (m MockManager) UpdateTest(projectId string, test *model.Test) error   { return nil }
func (m MockManager) DeleteTest(projectId string, testId string) error      { return nil }
func (m MockManager) DeleteAllTests() error                                 { return nil }

func (m MockManager) GetResults(projectId string) (*model.Result, error)          { return nil, nil }
func (m MockManager) GetResult(projectId, resultId string) (*model.Result, error) { return nil, nil }
func (m MockManager) CreateResult(projectId string, result *model.Result) error   { return nil }
func (m MockManager) UpdateResult(projectId string, result *model.Result) error   { return nil }
func (m MockManager) DeleteResult(projectId string, resultId string) error        { return nil }
func (m MockManager) DeleteAllResults() error                                     { return nil }

func (m MockManager) GetProviders() ([]*model.Provider, error)               { return nil, nil }
func (m MockManager) GetProvider(providerId string) (*model.Provider, error) { return nil, nil }
func (m MockManager) CreateProvider(provider *model.Provider) error          { return nil }
func (m MockManager) UpdateProvider(provider *model.Provider) error          { return nil }
func (m MockManager) DeleteProvider(providerId string) error                 { return nil }
func (m MockManager) GetJobsByProviderId(providerId string) ([]*model.ProviderJob, error) {
	return nil, nil
}
func (m MockManager) AddJobToProviderId(providerId string, job *model.ProviderJob) error {
	return nil
}
func (m MockManager) DeleteAllProviders() error {
	return nil
}
func (m MockManager) GetBuilds(projectId string, testId string) ([]*model.Build, error) {
	return nil, nil
}
func (m MockManager) GetBuild(projectId string, testId string, buildId string) (*model.Build, error) {
	return nil, nil
}
func (m MockManager) UpdateBuild(projectId string, testId string, buildId string, action *model.BuildAction) error {
	return nil
}
func (m MockManager) DeleteBuild(projectId string, testId string, buildId string) error {
	return nil
}

func (m MockManager) DeleteAllBuilds() error {
	return nil
}
func (m MockManager) GetBuildStatus(projectId string, testId string, buildId string) (string, error) {
	return "", nil
}
func (m MockManager) GetBuildById(buildId string) (*model.Build, error) {
	return nil, nil
}
func (m MockManager) UpdateBuildResults(buildId string, result model.BuildResult) error {
	return nil
}
func (m MockManager) VerifyIfImageExistsLocally(imageToCheck string) bool {
	return false
}
func (m MockManager) CreateBuild(projectId string, testId string, buildAction *model.BuildAction) (string, error) {
	return "", nil
}
func (m MockManager) UpdateBuildStatus(buildId string, status string) error {
	return nil
}
