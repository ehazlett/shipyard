package model

type Project struct {
	ID          string  `json:"id" gorethink:"id"`
	Name        string  `json:"name" gorethink:"name"`
	Description string  `json:"description" gorethink:"description"`
	Status      string  `json:"status" gorethink:"status"`
	Images      []Image `json:"images" gorethink:"images"`
	NeedsBuild  bool    `json:"needsBuild" gorethink:"needsBuild"`
	// TODO: eventually add timestamps for created and updated
}

func (p *Project) NewProject(name string, description string, status string, images []Image, needsBuild bool) *Project {

	return &Project{
		Name:        name,
		Description: description,
		Status:      status,
		Images:      images,
		NeedsBuild:  needsBuild,
	}
}
