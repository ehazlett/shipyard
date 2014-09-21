package shipyard

import "github.com/citadel/citadel"

type (
	Extension struct {
		ID          string          `json:"id,omitempty" gorethink:"id,omitempty"`
		Name        string          `json:"name,omitempty" gorethink:"name"`
		Image       string          `json:"image,omitempty" gorethink:"image"`
		Author      string          `json:"author,omitempty" gorethink:"author"`
		Description string          `json:"description,omitempty" gorethink:"description"`
		Version     string          `json:"version,omitempty" gorethink:"version"`
		Url         string          `json:"url,omitempty" gorethink:"url"`
		Config      ExtensionConfig `json:"config" gorethink:"config"`
	}
	ExtensionConfig struct {
		ContainerName     string            `json:"container_name,omitempty" gorethink:"container_name"`
		Cpus              float64           `json:"cpus,omitempty" gorethink:"cpus"`
		Memory            float64           `json:"memory,omitempty" gorethink:"memory"`
		Environment       map[string]string `json:"environment,omitempty" gorethink:"environment"`
		Args              []string          `json:"args,omitempty" gorethink:"args"`
		Volumes           []string          `json:"volumes,omitempty" gorethink:"volumes"`
		Ports             []*citadel.Port   `json:"ports,omitempty" gorethink:"ports"`
		DeployPerEngine   bool              `json:"deploy_per_engine" gorethink:"deploy_per_engine"`
		PromptArgs        []string          `json:"prompt_args,omitempty" gorethink:"prompt_args"`
		PromptEnvironment []string          `json:"prompt_env,omitempty" gorethink:"prompt_env"`
	}
)
