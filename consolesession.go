package shipyard

type ConsoleSession struct {
	ID          string `json:"id,omitempty" gorethink:"id,omitempty"`
	ContainerID string `json:"container_id,omitempty" gorethink:"container_id,omitempty"`
	Token       string `json:"token,omitempty" gorethink:"token,omitempty"`
}
