package shipyard

import (
	"crypto/tls"
	registry "github.com/shipyard/shipyard/registry/v2"
	"strings"
)

type Registry struct {
	ID             string                   `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           string                   `json:"name,omitempty" gorethink:"name,omitempty"`
	Addr           string                   `json:"addr,omitempty" gorethink:"addr,omitempty"`
	Username       string                   `json:"username,omitempty" gorethink:"username,omitempty"`
	Password       string                   `json:"password,omitempty" gorethink:"password,omitempty"`
	TlsSkipVerify  bool                     `json:"tls_skip_verify,omitempty" gorethink:"tls_skip_verify,omitempty"`
	registryClient *registry.RegistryClient `json:"-" gorethink:"-"`
}

func NewRegistry(id, name, addr, username, password string, tls_skip_verify bool) (*Registry, error) {
	var tlsConfig *tls.Config

	if tls_skip_verify {
		tlsConfig = &tls.Config{InsecureSkipVerify: true}
	}

	rClient, err := registry.NewRegistryClient(addr, tlsConfig, username, password)
	if err != nil {
		return nil, err
	}

	return &Registry{
		ID:             id,
		Name:           name,
		Addr:           addr,
		Username:       username,
		Password:       password,
		TlsSkipVerify:  tls_skip_verify,
		registryClient: rClient,
	}, nil
}

func (r *Registry) InitRegistryClient() error {
	var tlsConfig *tls.Config

	if r.TlsSkipVerify {
		tlsConfig = &tls.Config{InsecureSkipVerify: true}
	}

	rClient, err := registry.NewRegistryClient(r.Addr, tlsConfig, r.Username, r.Password)
	if err != nil {
		return err
	}

	r.registryClient = rClient

	return nil
}

func (r *Registry) Repositories() ([]*registry.Repository, error) {
	res, err := r.registryClient.Search("")
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (r *Registry) Repository(name string) (*registry.Repository, error) {
	repoPath := name
	tag := "latest"
	parts := strings.Split(name, ":")
	if len(parts) == 2 {
		repoPath = parts[0]
		tag = parts[1]
	}
	return r.registryClient.Repository(r.Addr, repoPath, tag)
}

func (r *Registry) DeleteRepository(name string) error {
	return r.registryClient.DeleteRepository(name)
}
