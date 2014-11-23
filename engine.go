package shipyard

import (
	"github.com/citadel/citadel"
)

type (
	Health struct {
		Status       string `json:"status,omitempty" gorethink:"status,omitempty"`
		ResponseTime int64  `json:"response_time,omitempty" gorethink:"response_time,omitempty"`
	}

	Engine struct {
		ID             string          `json:"id,omitempty" gorethink:"id,omitempty"`
		SSLCertificate string          `json:"ssl_cert,omitempty" gorethink:"ssl_cert,omitempty"`
		SSLKey         string          `json:"ssl_key,omitempty" gorethink:"ssl_key,omitempty"`
		CACertificate  string          `json:"ca_cert,omitempty" gorethink:"ca_cert,omitempty"`
		Engine         *citadel.Engine `json:"engine,omitempty" gorethink:"engine,omitempty"`
		Health         *Health         `json:"health,omitempty" gorethink:"health,omitempty"`
		DockerVersion  string          `json:"docker_version,omitempty"`
	}
)
