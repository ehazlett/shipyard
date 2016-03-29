package model

import (
	"go/types"
)

type Provider struct {
	ID                string         `json:"id,omitempty" gorethink:"id,omitempty"`
	Name              string         `json:"name" gorethink:"name"`
	AvailableJobTypes types.Array    `json:"availableJobTypes" gorethink:"availableJobTypes"`
	Config            types.Object   `json:"config" gorethink:"config"`
	Url               string         `json:"url" gorethink:"url"`
	ProviderJobs      []*ProviderJob `json:"providerJobs" gorethink:"providerJobs"`
}

func (p *Provider) NewProvider(name string, availableJobTypes types.Array, config types.Object, url string, providerJobs []*ProviderJob) *Provider {

	return &Provider{
		Name:              name,
		AvailableJobTypes: availableJobTypes,
		Config:            config,
		Url:               url,
		ProviderJobs:      providerJobs,
	}
}

type ProviderJob struct {
	ID   string `json:"id,omitempty" gorethink:"id,omitempty"`
	Name string `json:"name" gorethink:"name"`
}

func (p *ProviderJob) NewProviderJob(name string) *ProviderJob {

	return &ProviderJob{
		Name: name,
	}
}
