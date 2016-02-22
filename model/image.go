package model

type Image struct {
	ID        string `json:"id,omitempty" gorethink:"id,omitempty"`
	Name      string `json:"name" gorethink:"name"`
	ImageId   string `json:"imageId" gorethink:"imageId"`
	ProjectID string `json:"projectId" gorethink:"projectId"`
}

func (i *Image) NewImage(name string, imageId string, projectId string) *Image {

	return &Image{
		Name:      name,
		ImageId:   imageId,
		ProjectID: projectId,
	}
}
