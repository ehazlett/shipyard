package client

type (
	ShipyardConfig struct {
		Url      string `json:"url,omitempty"`
		Username string `json:"username,omitempty"`
		Token    string `json:"token,omitempty"`
	}
)
