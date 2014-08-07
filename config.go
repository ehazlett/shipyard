package shipyard

import (
	"github.com/citadel/citadel"
)

type (
	Engine struct {
		SSLCertificate string          `json:"ssl-cert,omitempty"`
		SSLKey         string          `json:"ssl-key,omitempty"`
		CACertificate  string          `json:"ca-cert,omitempty"`
		Engine         *citadel.Engine `json:"engine,omitempty"`
	}
)
