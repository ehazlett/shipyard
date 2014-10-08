package shipyard

type (
	Usage struct {
		ID              string  `json:"id,omitempty"`
		Version         string  `json:"version,omitempty"`
		NumOfEngines    int     `json:"num_of_engines,omitempty"`
		NumOfImages     int     `json:"num_of_images,omitempty"`
		NumOfContainers int     `json:"num_of_containers,omitempty"`
		TotalCpus       float64 `json:"total_cpus,omitempty"`
		TotalMemory     float64 `json:"total_memory,omitempty"`
	}
)
