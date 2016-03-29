package model

import (
	"go/types"
	"time"
)

type Build struct {
	ID        string         `json:"id,omitempty" gorethink:"id,omitempty"`
	StartTime time.Time      `json:"startTime" gorethink:"startTime"`
	EndTime   time.Time      `json:"endTime" gorethink:"endTime"`
	Config    *BuildConfig   `json:"config" gorethink:"config"`
	Status    *BuildStatus   `json:"status" gorethink:"status"`
	Results   []*BuildResult `json:"results" gorethink:"results"`
}

func (b *Build) NewBuild(startTime time.Time, endTime time.Time, config *BuildConfig, status *BuildStatus, results []*BuildResult) *Build {

	return &Build{
		StartTime: startTime,
		EndTime:   endTime,
		Config:    config,
		Status:    status,
		Results:   results,
	}
}

type BuildAction struct {
	ID     string `json:"id,omitempty" gorethink:"id,omitempty"`
	Action string `json:"action" gorethink:"status"`
}

func (b *BuildAction) NewBuildAction(action string) *BuildAction {

	return &BuildAction{
		Action: action,
	}
}

type BuildConfig struct {
	ID               string            `json:"id,omitempty" gorethink:"id,omitempty"`
	Name             string            `json:"name" gorethink:"name"`
	Description      string            `json:"description" gorethink:"description"`
	Targets          []*TargetArtifact `json:"targets" gorethink:"targets"`
	SelectedTestType string            `json:"selectedTestType" gorethink:"selectedTestType"`
	ProviderId       string            `json:"providerId" gorethink:"providerId"`
}

func (b *BuildConfig) NewBuildConfig(name string, description string, targets []*TargetArtifact, selectedTestType string, providerId string) *BuildConfig {

	return &BuildConfig{
		Name:             name,
		Description:      description,
		Targets:          targets,
		SelectedTestType: selectedTestType,
		ProviderId:       providerId,
	}
}

type BuildResult struct {
	ID             string          `json:"id,omitempty" gorethink:"id,omitempty"`
	BuildId        string          `json:"buildId" gorethink:"buildId"`
	TargetArtifact *TargetArtifact `json:"targetArtifact" gorethink:"targetArtifact"`
	ResultEntries  []*types.Object `json:"resultEntries" gorethink:"resultEntries"`
	TimeStamp      time.Time       `json:"timeStamp" gorethink:"timeStamp"`
}

func (b *BuildResult) NewBuildResult(buildId string, artifact *TargetArtifact, results []*types.Object, time time.Time) *BuildResult {

	return &BuildResult{
		BuildId:        buildId,
		TargetArtifact: artifact,
		ResultEntries:  results,
		TimeStamp:      time,
	}
}

type BuildStatus struct {
	ID      string `json:"id,omitempty" gorethink:"id,omitempty"`
	BuildId string `json:"buildId" gorethink:"buildId"`
	Status  string `json:"status" gorethink:"status"`
}

func (b *BuildStatus) NewBuildStatus(buildId string, status string) *BuildStatus {

	return &BuildStatus{
		BuildId: buildId,
		Status:  status,
	}
}
