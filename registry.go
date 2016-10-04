package shipyard

import (
	"encoding/json"
	"net/url"
	registry "github.com/shipyard/shipyard/registry/v2"
)

type Registry struct {
	ID             string                   `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           string                   `json:"name,omitempty" gorethink:"name,omitempty"`
	Addr           string                   `json:"addr,omitempty", gorethink:"addr,omitempty"`
	registryClient *registry.RegistryClient `json:"-" gorethink:"-"`
}

// Custom marshaling for the Registry object in JSON
func (c *Registry) MarshalJSON() ([]byte, error) {
    // Here we remove the username/password of Basic auth URL if any before sending it through the pipe.
    ID, err := json.Marshal(c.ID)
    
    if err != nil {
        return nil, err
    }

    Name, err := json.Marshal(c.Name)
    
    if err != nil {
        return nil, err
    }

    Url, err := url.Parse(c.Addr)

    if err != nil {
        return nil, err
    }

    Url.User = nil

    UrlStr, err := json.Marshal(Url.String())
    
    if err != nil {
        return nil, err
    }

    // Stitching it all together
    return []byte(`{"id":` + string(ID) + `,"name":` + string(Name) + `,"addr":` + string(UrlStr) + `}`), nil
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
	res, err := r.registryClient.Search("", 1, 100)
	if err != nil {
		return nil, err
	}

	return res.Results, nil
}

func (r *Registry) Repository(name string) (*registry.Repository, error) {
	return r.registryClient.Repository(name)
}

func (r *Registry) DeleteRepository(name string) error {
	return r.registryClient.DeleteRepository(name)
}
