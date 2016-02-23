package model

import "time"

type Project struct {
	ID          string `json:"id,omitempty" gorethink:"id,omitempty"`
	Name        string `json:"name" gorethink:"name"`
	Description string `json:"description" gorethink:"description"`
	Status      string `json:"status" gorethink:"status"`
	// TODO: we might be able to generate this by performing a join with a subquery
	Images     []*Image `json:"images" gorethink:"images"`
	NeedsBuild bool    `json:"needsBuild" gorethink:"needsBuild"`
	// TODO: eventually add timestamps for created and updated
	CreationTime time.Time `json:"creationTime" gorethink:"creationTime"`
	UpdateTime   time.Time `json:"updateTime" gorethink:"updateTime"`
}

func (p *Project) NewProject(name string, description string, status string, images []*Image, needsBuild bool, creationTime time.Time, updateTime time.Time) *Project {

	return &Project{
		Name:         name,
		Description:  description,
		Status:       status,
		Images:       images,
		NeedsBuild:   needsBuild,
		CreationTime: creationTime,
		UpdateTime:   updateTime,
	}
}
