package model

import "time"

type Project struct {
	ID          	string  `json:"id" gorethink:"id"`
	Name        	string  `json:"name" gorethink:"name"`
	Description 	string  `json:"description" gorethink:"description"`
	Status      	string  `json:"status" gorethink:"status"`
	Images      	[]Image `json:"images" gorethink:"images"`
	NeedsBuild 	bool    `json:"needsBuild" gorethink:"needsBuild"`
	// TODO: eventually add timestamps for created and updated
	CreationTime time.Time `json:"creationTime" gorethink:"creationTime"`
	UpdateTime time.Time `json:"updateTime" gorethink:"updateTime"`
}

func (p *Project) NewProject(name string, description string, status string, images []Image, needsBuild bool, creationTime time.Time, updateTime time.Time) *Project {

	return &Project{
		Name:        	name,
		Description: 	description,
		Status:    	status,
		Images:      	images,
		NeedsBuild:  	needsBuild,
		CreationTime: 	creationTime,
		UpdateTime:	updateTime,
	}
}
