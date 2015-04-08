package v1

type (
	SearchResult struct {
		NumberOfResults int           `json:"num_results,omitempty"`
		Query           string        `json:"string,omitempty"`
		Results         []*Repository `json:"results,omitempty"`
	}
)
