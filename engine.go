package shipyard

import (
	"github.com/citadel/citadel"
)

type (
	Engine struct {
		ID             string          `json:"id,omitempty" gorethink:"id,omitempty"`
		SSLCertificate string          `json:"ssl_cert,omitempty" gorethink:"ssl_cert,omitempty"`
		SSLKey         string          `json:"ssl_key,omitempty" gorethink:"ssl_key,omitempty"`
		CACertificate  string          `json:"ca_cert,omitempty" gorethink:"ca_cert,omitempty"`
		Engine         *citadel.Engine `json:"engine,omitempty" gorethink:"engine,omitempty"`
	}
)
