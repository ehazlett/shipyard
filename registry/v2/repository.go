package v2

import (
	"time"

	"github.com/samalba/dockerclient"
)

type (
	Tag struct {
		ID   string
		Name string
	}

	ContainerConfig struct {
		dockerclient.ContainerConfig
		Cmd []string `json:"Cmd,omitempty"`
	}

	Layer struct {
		ID              string           `json:"id,omitempty"`
		BlobSum         string           `json:"blobSum,omitempty"`
		Parent          string           `json:"parent,omitempty"`
		Created         *time.Time       `json:"created,omitempty"`
		Container       string           `json:"container,omitempty"`
		ContainerConfig *ContainerConfig `json:"container_config,omitempty"`
		DockerVersion   string           `json:"docker_version,omitempty"`
		Author          string           `json:"author,omitempty"`
		Architecture    string           `json:"architecture,omitempty"`
		OS              string           `json:"os,omitempty"`
		Size            int64            `json:"size,omitempty"`
		Ancestry        []string         `json:"ancestry,omitempty"`
	}

	Repository struct {
		Description string  `json:"description,omitempty"`
		Name        string  `json:"name,omitempty"`
		Namespace   string  `json:"namespace,omitempty"`
		Repository  string  `json:"repository,omitempty"`
		Tags        []Tag   `json:"tags,omitempty"`
		Layers      []Layer `json:"layers,omitempty"`
		Size        int64   `json:"size,omitempty"`
	}
)
