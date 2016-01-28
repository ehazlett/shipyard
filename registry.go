package shipyard

import (
	registry "github.com/shipyard/shipyard/registry/v2"
)

type Registry struct {
	ID             string                   `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           string                   `json:"name,omitempty" gorethink:"name,omitempty"`
	Addr           string                   `json:"addr,omitempty", gorethink:"addr,omitempty"`
	registryClient *registry.RegistryClient `json:"-" gorethink:"-"`
}

func NewRegistry(id, name, addr string) (*Registry, error) {
	rClient, err := registry.NewRegistryClient(addr, nil)
	if err != nil {
		return nil, err
	}

	return &Registry{
		ID:             id,
		Name:           name,
		Addr:           addr,
		registryClient: rClient,
	}, nil
}

func (r *Registry) Repositories() ([]*registry.Repository, error) {
	res, err := r.registryClient.Search("")
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (r *Registry) Repository(name string) (*registry.Repository, error) {
	return r.registryClient.Repository(name, "latest")
}

func (r *Registry) DeleteRepository(name string) error {
	return r.registryClient.DeleteRepository(name)
}
