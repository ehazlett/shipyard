package model

type Image struct {
	ID             string `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           string `json:"name" gorethink:"name"`
	ImageId        string `json:"imageId" gorethink:"imageId"`
	Tag            string `json:"tag" gorethink:"tag"`
	Description    string `json:"description" gorethink:"description"`
	Location       string `json:"location" gorethink:"location"`
	SkipImageBuild bool   `json:"skipImageBuild" gorethink:"skipImageBuild"`
	ProjectID      string `json:"projectId" gorethink:"projectId"`
}

func (i *Image) NewImage(name string, imageId string, tag string, description string, location string, skipImageBuild bool, projectId string) *Image {

	return &Image{
		Name:           name,
		ImageId:        imageId,
		Tag:            tag,
		Description:    description,
		Location:       location,
		SkipImageBuild: skipImageBuild,
		ProjectID:      projectId,
	}
}
