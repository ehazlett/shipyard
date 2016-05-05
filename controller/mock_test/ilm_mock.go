package mock_test

import "github.com/shipyard/shipyard/model"

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

func (m MockManager) UpdateImage(projectId string, image *model.Image) error {
	return nil
}

func (m MockManager) DeleteImage(projectId string, imageId string) error {
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

func (m MockManager) CreateImage(projectId string, image *model.Image) error {
	return nil
}

func (m MockManager) GetBuildResults(projectId string, testId string, buildId string) ([]*model.BuildResult, error) {
	return nil, nil
}

func (m MockManager) GetImage(projectId string, imageId string) (*model.Image, error) {
	return nil, nil
}

func (m MockManager) GetImages(projectId string) ([]*model.Image, error) {
	return nil, nil
}

func (m MockManager) PullImage(pullableImageName string, username, password string) error {
	return nil
}
func (m MockManager) UpdateImageIlmTags(projectId string, imageId string, ilmTag string) error {
	return nil
}
func (m MockManager) GetRegistry(registryId string) (*model.Registry, error) { return nil, nil }
func (m MockManager) PingRegistry(registry *model.Registry) error            { return nil }
