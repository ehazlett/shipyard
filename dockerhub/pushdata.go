package dockerhub

type (
	PushData struct {
		PushedAt int      `json:"pushed_at,omitempty"`
		Images   []string `json:"images,omitempty"`
		Pusher   string   `json:"pusher,omitempty"`
	}
)
