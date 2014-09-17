package shipyard

type (
	Extension struct {
		ID          string            `json:"id,omitempty" gorethink:"id,omitempty"`
		Name        string            `json:"string,omitempty" gorethink:"name,omitempty"`
		Author      string            `json:"author,omitempty" gorethink:"author,omitempty"`
		Description string            `json:"description,omitempty" gorethink:"description,omitempty"`
		Version     string            `json:"version,omitempty" gorethink:"version,omitempty"`
		Url         string            `json:"url,omitempty" gorethink:"url,omitempty"`
		Environment map[string]string `json:"environment,omitempty" gorethink:"environment,omitempty"`
		Args        []string          `json:"args,omitempty" gorethink:"args,omitempty"`
		Ports       []int             `json:"ports,omitempty" gorethink:"ports,omitempty"`
		Config      *ExtensionConfig  `json:"config,omitempty" gorethink:"config,omitempty"`
	}
	ExtensionConfig struct {
		DeployPerEngine bool `json:"deploy_per_engine,omitempty" gorethink:"deploy_per_engine,omitempty"`
	}
)
