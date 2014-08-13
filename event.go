package shipyard

import (
	"time"

	"github.com/citadel/citadel"
)

type Event struct {
	Type      string             `json:"type,omitempty"`
	Container *citadel.Container `json:"container,omitempty"`
	Engine    *citadel.Engine    `json:"engine,omitempty"`
	Time      time.Time          `json:"time,omitempty"`
	Info      string             `json:"info,omitempty"`
	Tags      []string           `json:"tags,omitempty"`
}
