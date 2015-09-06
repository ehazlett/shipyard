package shipyard

import (
	"time"

	"github.com/samalba/dockerclient"
)

type Event struct {
	Type          string                      `json:"type,omitempty"`
	ContainerInfo *dockerclient.ContainerInfo `json:"container_info,omitempty"`
	Time          time.Time                   `json:"time,omitempty"`
	Message       string                      `json:"message,omitempty"`
	Username      string                      `json:"username,omitempty"`
	Tags          []string                    `json:"tags,omitempty"`
}
