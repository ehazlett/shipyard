package model

type Report struct {
	ImageName string     `json:"imageName" gorethink:"imageName"`
	Message   string     `json:"message,omitempty" gorethink:"message,omitempty"`
	Features  []*Feature `json:"features,omitempty" gorethink:"features,omitempty"`
}

type Feature struct {
	Name            string           `json:"name" gorethink:"name"`
	AddedBy         string           `json:"addedBy" gorethink:"addedby"`
	Vulnerabilities []*Vulnerability `json:"vulnerabilities,omitempty" gorethink:"vulnerabilities,omitempty"`
	Version         string           `json:"version" gorethink:"version"`
}

type Vulnerability struct {
	Name        string `json:"name" gorethink:"name"`
	Severity    string `json:"severity" gorethink:"severity"`
	Description string `json:"description,omitempty" gorethink:"description,omitempty"`
	Link        string `json:"link,omitempty" gorethink:"link,omitempty"`
	FixedBy     string `json:"fixedBy,omitempty" gorethink:"fixedBy,omitempty"`
	Metadata    string `json:"metadata,omitempty" gorethink:"metadata, omitempty"`
}
