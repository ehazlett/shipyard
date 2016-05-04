package model

type Image struct {
	ID             string `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           string `json:"name" gorethink:"name"`
	ImageId        string `json:"imageId" gorethink:"imageId"`
	Tag            string `json:"tag" gorethink:"tag"`
	Description    string `json:"description" gorethink:"description"`
	RegistryId     string `json:"registry" gorethink:"registry"`
	Location       string `json:"location" gorethink:"location"`
	SkipImageBuild bool   `json:"skipImageBuild" gorethink:"skipImageBuild"`
	ProjectId      string `json:"projectId" gorethink:"projectId"`
}

func (i *Image) NewImage(name string, imageId string, tag string, description string, registryId string, location string, skipImageBuild bool, projectId string) *Image {

	image := new(Image)
	image.Name = name
	image.ImageId = imageId
	image.Tag = tag
	image.Description = description
	image.RegistryId = registryId
	image.Location = location
	image.SkipImageBuild = skipImageBuild
	image.ProjectId = projectId

	return image
}
