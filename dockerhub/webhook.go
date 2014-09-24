package dockerhub

type (
	Webhook struct {
		PushData   *PushData   `json:"push_data,omitempty"`
		Repository *Repository `json:"repository,omitempty"`
	}
)
