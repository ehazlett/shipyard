package manager

import (
	"fmt"
	r "github.com/dancannon/gorethink"
	"github.com/shipyard/shipyard/model"
)

// Methods related to the Provider structure
func (m DefaultManager) GetProviders() ([]*model.Provider, error) {

	res, err := r.Table(tblNameProviders).OrderBy(r.Asc("name")).Run(m.session)
	if err != nil {
		return nil, err
	}
	providers := []*model.Provider{}
	if err := res.All(&providers); err != nil {
		return nil, err
	}
	return providers, nil
}

func (m DefaultManager) GetProvider(providerId string) (*model.Provider, error) {
	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrProviderDoesNotExist
	}
	var provider *model.Provider
	if err := res.One(&provider); err != nil {
		return nil, err
	}
	return provider, nil
}

func (m DefaultManager) CreateProvider(provider *model.Provider) error {
	var eventType string

	prov, err := m.GetProvider(provider.ID)
	if err != nil && err != ErrProviderDoesNotExist {
		return err
	}
	if prov != nil {
		return ErrProviderExists
	}

	response, err := r.Table(tblNameProviders).Insert(provider).RunWrite(m.session)

	if err != nil {
		return err
	}
	eventType = "add-provider"

	provider.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", provider.ID, provider.Name), []string{"security"})

	return nil
}

func (m DefaultManager) UpdateProvider(provider *model.Provider) error {
	var eventType string

	// check if exists; if so, update
	prov, err := m.GetProvider(provider.ID)
	if err != nil && err != ErrProviderDoesNotExist {
		return err
	}
	// update

	if prov != nil {
		updates := map[string]interface{}{
			"name":              provider.Name,
			"availableJobTypes": provider.AvailableJobTypes,
			"config":            provider.Config,
			"url":               provider.Url,
			"providerJobs":      provider.ProviderJobs,
		}

		if _, err := r.Table(tblNameProviders).Filter(map[string]string{"id": provider.ID}).Update(updates).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-provider"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", provider.ID, provider.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteProvider(providerId string) error {
	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrProviderDoesNotExist
	}

	m.logEvent("delete-provider", fmt.Sprintf("id=%s", providerId), []string{"security"})

	return nil
}

func (m DefaultManager) GetJobsByProviderId(providerId string) ([]*model.ProviderJob, error) {
	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrProviderDoesNotExist
	}
	var provider *model.Provider
	if err := res.One(&provider); err != nil {
		return nil, err
	}
	return provider.ProviderJobs, nil
}

func (m DefaultManager) AddJobToProviderId(providerId string, job *model.ProviderJob) error {

	var eventType string

	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Run(m.session)
	if err != nil {
		return err
	}
	if res.IsNil() {
		return ErrProviderDoesNotExist
	}
	var provider *model.Provider
	if err := res.One(&provider); err != nil {
		return err
	}

	provider.ProviderJobs = append(provider.ProviderJobs, job)

	if _, err := r.Table(tblNameProviders).Filter(map[string]string{"id": provider.ID}).Update(provider).RunWrite(m.session); err != nil {
		return err
	}
	eventType = "add-job-to-provider"

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", provider.ID, provider.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAllProviders() error {
	_, err := r.Table(tblNameProviders).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}
