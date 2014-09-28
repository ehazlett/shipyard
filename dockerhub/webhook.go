package dockerhub

type (
	Webhook struct {
		PushData   *PushData   `json:"push_data,omitempty"`
		Repository *Repository `json:"repository,omitempty"`
	}
	WebhookKey struct {
		ID    string `json:"id,omitempty" gorethink:"id,omitempty"`
		Image string `json:"image,omitempty" gorethink:"image"`
		Key   string `json:"key,omitempty" gorethink:"key"`
	}
)
