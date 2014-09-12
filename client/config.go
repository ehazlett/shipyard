package client

type (
	ShipyardConfig struct {
		Url        string `json:"url,omitempty"`
		ServiceKey string `json:"service_key,omitempty"`
		Username   string `json:"username,omitempty"`
		Token      string `json:"token,omitempty"`
	}
)
