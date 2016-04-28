package model

type Report struct {
	ImageName string     `json:"imageName"`
	Message   string     `json:"message,omitempty"`
	Features  []*Feature `json:"features,omitempty"`
}

type Feature struct {
	Name            string           `json:"name"`
	AddedBy         string           `json:"addedBy"`
	Vulnerabilities []*Vulnerability `json:"vulnerabilities,omitempty"`
	Version         string           `json:"version"`
}

type Vulnerability struct {
	Name        string `json:"name"`
	Severity    string `json:"severity"`
	Description string `json:"description,omitempty"`
	Link        string `json:"link,omitempty"`
	FixedBy     string `json:"fixedBy,omitempty"`
	Metadata    string `json:"metadata,omitempty"`
}
