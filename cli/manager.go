package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/citadel/citadel"
	"github.com/shipyard/shipyard"
)

type (
	Manager struct {
		baseUrl string
	}
)

func NewManager(baseUrl string) *Manager {
	m := &Manager{
		baseUrl: baseUrl,
	}
	return m
}

func (m *Manager) buildUrl(path string) string {
	return fmt.Sprintf("%s%s", m.baseUrl, path)
}

func (m *Manager) Containers() ([]*citadel.Container, error) {
	containers := []*citadel.Container{}
	url := m.buildUrl("/api/containers")
	r, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	if err := json.NewDecoder(r.Body).Decode(&containers); err != nil {
		return nil, err
	}
	return containers, nil
}

func (m *Manager) Run(image *citadel.Image, pull bool) (*citadel.Container, error) {
	b, err := json.Marshal(image)
	if err != nil {
		return nil, err
	}
	buf := bytes.NewBuffer(b)
	url := m.buildUrl(fmt.Sprintf("/api/run?pull=%v", pull))
	resp, err := http.Post(url, "application/json", buf)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 201 {
		c, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		return nil, errors.New(string(c))
	}
	var container citadel.Container
	if err := json.NewDecoder(resp.Body).Decode(&container); err != nil {
		return nil, err
	}
	return &container, nil
}

func (m *Manager) Destroy(container *citadel.Container) error {
	b, err := json.Marshal(container)
	if err != nil {
		return err
	}
	buf := bytes.NewBuffer(b)
	url := m.buildUrl("/api/destroy")
	req, err := http.NewRequest("DELETE", url, buf)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	if resp.StatusCode != 204 {
		c, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return errors.New(string(c))
	}
	return nil
}

func (m *Manager) Engines() ([]*shipyard.Engine, error) {
	engines := []*shipyard.Engine{}
	url := m.buildUrl("/api/engines")
	r, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	if err := json.NewDecoder(r.Body).Decode(&engines); err != nil {
		return nil, err
	}
	return engines, nil
}

func (m *Manager) AddEngine(engine *shipyard.Engine) error {
	b, err := json.Marshal(engine)
	if err != nil {
		return err
	}
	buf := bytes.NewBuffer(b)
	url := m.buildUrl("/api/engines/add")
	resp, err := http.Post(url, "application/json", buf)
	if err != nil {
		return err
	}
	if resp.StatusCode != 201 {
		c, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return errors.New(string(c))
	}
	return nil
}

func (m *Manager) RemoveEngine(engine *shipyard.Engine) error {
	b, err := json.Marshal(engine)
	if err != nil {
		return err
	}
	buf := bytes.NewBuffer(b)
	url := m.buildUrl("/api/engines/remove")
	resp, err := http.Post(url, "application/json", buf)
	if err != nil {
		return err
	}
	if resp.StatusCode != 204 {
		c, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return errors.New(string(c))
	}
	return nil
}

func (m *Manager) GetContainer(id string) (*citadel.Container, error) {
	var container *citadel.Container
	url := m.buildUrl(fmt.Sprintf("/api/containers/%s", id))
	r, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	if err := json.NewDecoder(r.Body).Decode(&container); err != nil {
		return nil, err
	}
	return container, nil
}

func (m *Manager) GetEngine(id string) (*shipyard.Engine, error) {
	var engine *shipyard.Engine
	url := m.buildUrl(fmt.Sprintf("/api/engines/%s", id))
	r, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	if err := json.NewDecoder(r.Body).Decode(&engine); err != nil {
		return nil, err
	}
	return engine, nil
}

func (m *Manager) Info() (*citadel.ClusterInfo, error) {
	var info *citadel.ClusterInfo
	url := m.buildUrl("/api/cluster/info")
	r, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	if err := json.NewDecoder(r.Body).Decode(&info); err != nil {
		return nil, err
	}
	return info, nil
}

func (m *Manager) Events() ([]*shipyard.Event, error) {
	events := []*shipyard.Event{}
	url := m.buildUrl("/api/events")
	r, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	if err := json.NewDecoder(r.Body).Decode(&events); err != nil {
		return nil, err
	}
	return events, nil
}

func (m *Manager) Accounts() ([]*shipyard.Account, error) {
	accounts := []*shipyard.Account{}
	url := m.buildUrl("/api/accounts")
	r, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	if err := json.NewDecoder(r.Body).Decode(&accounts); err != nil {
		return nil, err
	}
	return accounts, nil
}

func (m *Manager) AddAccount(account *shipyard.Account) error {
	b, err := json.Marshal(account)
	if err != nil {
		return err
	}
	buf := bytes.NewBuffer(b)
	url := m.buildUrl("/api/accounts")
	resp, err := http.Post(url, "application/json", buf)
	if err != nil {
		return err
	}
	if resp.StatusCode != 204 {
		c, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return errors.New(string(c))
	}
	return nil
}

func (m *Manager) DeleteAccount(account *shipyard.Account) error {
	b, err := json.Marshal(account)
	if err != nil {
		return err
	}
	buf := bytes.NewBuffer(b)
	url := m.buildUrl("/api/accounts")
	req, err := http.NewRequest("DELETE", url, buf)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	if resp.StatusCode != 204 {
		c, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return errors.New(string(c))
	}
	return nil
}
