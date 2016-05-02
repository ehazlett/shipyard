package model

import (
	"go/types"
	"time"
)

type Result struct {
	ID             string        `json:"id,omitempty" gorethink:"id,omitempty"`
	ProjectId      string        `json:"projectId" gorethink:"projectId"`
	Description    string        `json:"description" gorethink:"description"`
	BuildId        string        `json:"buildId" gorethink:"buildId"`
	RunDate        time.Time     `json:"runDate" gorethink:"runDate"`
	EndDate        time.Time     `json:"endDate" gorethink:"endDate"`
	CreateDate     time.Time     `json:"createDate" gorethink:"createDate"`
	Author         string        `json:"author" gorethink:"author"`
	ProjectVersion string        `json:"projectVersion" gorethink:"lastRunTime"`
	LastTagApplied string        `json:"lastTagapplied" gorethink:"lastTagApplied"`
	LastUpdate     time.Time     `json:"lastUpdate" gorethink:"lastUpdate"`
	Updater        string        `json:"updater" gorethink:"updater"`
	TestResults    []*TestResult `json:"testResults" gorethink:"testResults"`
}

func NewResult(
	projectId string,
	description string,
	buildId string,
	runDate time.Time,
	endDate time.Time,
	createDate time.Time,
	author string,
	projectVersion string,
	lastTagApplied string,
	lastUpdate time.Time,
	updater string,
	testResults []*TestResult,
) *Result {

	return &Result{
		ProjectId:      projectId,
		Description:    description,
		BuildId:        buildId,
		RunDate:        runDate,
		EndDate:        endDate,
		CreateDate:     createDate,
		Author:         author,
		ProjectVersion: projectVersion,
		LastTagApplied: lastTagApplied,
		LastUpdate:     lastUpdate,
		Updater:        updater,
		TestResults:    testResults,
	}
}

type SimpleResult struct {
	Status     string        `json:"status" gorethink:"status"`
	Date       time.Time     `json:"date" gorethink:"date"`
	EndDate    time.Time     `json:"endDate" gorethink:"endDate"`
	AppliedTag []string      `json:"appliedTag" gorethink:"appliedTag"`
	Action     *types.Object `json:"action" gorethink:"action"`
}

func (s *SimpleResult) NewSimpleResult(
	imageId string,
	testId string,
	blocker bool,
	status string,
	date time.Time,
	endDate time.Time,
	appliedTag []string,
	action *types.Object,
) *SimpleResult {

	return &SimpleResult{
		Status:     status,
		Date:       date,
		EndDate:    endDate,
		AppliedTag: appliedTag,
		Action:     action,
	}
}

type Parameter struct {
	ParamName  string   `json:"paramName" gorethink:"paramName"`
	ParamValue []string `json:"paramValue" gorethink:"paramValue"`
}
type Test struct {
	ID               string            `json:"id,omitempty" gorethink:"id,omitempty"`
	Name             string            `json:"name" gorethink:"name"`
	Description      string            `json:"description" gorethink:"description"`
	Targets          []*TargetArtifact `json:"targets" gorethink:"targets"`
	SelectedTestType string            `json:"selectedTestType" gorethink:"selectedTestType"`
	Provider         TestProvider      `json:"provider" gorethink:"provider"`
	Tagging          Tagging           `json:"tagging" gorethink:"tagging"`
	FromTag          string            `json:"fromTag" gorethink:"fromTag"`
	Parameters       []*Parameter      `json:"parameters" gorethink:"parameters"`
	ProjectId        string            `json:"projectId" gorethink:"projectId"`
}
type TestProvider struct {
	ProviderType string `json:"providerType" gorethink:"providerType"`
	ProviderName string `json:"providerName" gorethink:"providerName"`
	ProviderTest string `json:"ProviderTest" gorethink:"ProviderTest"`
}
type Tagging struct {
	OnSuccess string `json:"onSuccess" gorethink:"onSuccess"`
	OnFailure string `json:"onFailure" gorethink:"onFailure"`
}

func (t *Test) NewTest(
	name string,
	description string,
	targets []*TargetArtifact,
	selectedTestType string,
	projectId string,
	providerType string,
	providerName string,
	providerTest string,
	parameters []*Parameter,
	successTag string,
	failTag string,
	fromTag string,
) *Test {
	test := new(Test)

	test.Name = name
	test.Description = description
	test.Targets = targets
	test.SelectedTestType = selectedTestType
	test.Provider.ProviderType = providerType
	test.Provider.ProviderName = providerName
	test.Provider.ProviderTest = providerTest
	test.Tagging.OnSuccess = successTag
	test.Tagging.OnFailure = failTag
	test.FromTag = fromTag
	test.Parameters = parameters
	test.ProjectId = projectId

	return test
}

type TestResult struct {
	ID            string `json:"id,omitempty" gorethink:"id,omitempty"`
	ImageId       string `json:"imageId" gorethink:"imageId"`
	ImageName     string `json:"imageName" gorethink:"imageName"`
	BuildId       string `json:"buildId" gorethink:"buildId"`
	DockerImageId string `json:"dockerImageId" gorethink:"dockerImageId"`
	TestId        string `json:"testId" gorethink:"testId"`
	TestName      string `json:"testName" gorethink:"testName"`
	Blocker       bool   `json:"blocker" gorethink:"blocker"`
	SimpleResult
}

func NewTestResult(
	imageId string,
	imageName string,
	buildId string,
	dockerImageId string,
	testId string,
	testName string,
	blocker bool,
	status string,
	date time.Time,
	endDate time.Time,
	appliedTag []string,
	action *types.Object,
) *TestResult {
	testResult := new(TestResult)
	testResult.ImageId = imageId
	testResult.ImageName = imageName
	testResult.BuildId = buildId
	testResult.DockerImageId = dockerImageId
	testResult.TestId = testId
	testResult.BuildId = buildId
	testResult.TestName = testName
	testResult.Blocker = blocker
	testResult.Status = status
	testResult.Date = date
	testResult.EndDate = endDate
	testResult.AppliedTag = appliedTag
	testResult.Action = action

	return testResult
}
