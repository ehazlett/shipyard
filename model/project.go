package model

type Project struct {

	ProjectID       string          `json:"project_id,omitempty"`
	Name 		string 		`json:"name,omitempty"`
	Description     string		`json:"description,omitempty"`
	Status       	string    	`json:"status,omitempty"`
	Images		[]Image		`json:"images,omitempty"`
	IsBuildNeeded	bool		`json:"buildNeeded,omitempty"`

}