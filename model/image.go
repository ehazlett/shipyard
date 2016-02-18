package model

type Image struct {
	ID      string `json:"id" gorethink:"id"`
	Name    string `json:"name" gorethink:"name"`
	ImageId string `json:"imageId" gorethink:"imageId"`
	ProjectID string `json:"projectId" gorethink:"projectId"`
}

func (i *Image) NewImage(id string, name string, imageId string, projectId string) *Image {

	return &Image{
		ID:	id,
		Name:	name,
		ImageId:imageId,
		ProjectID: projectId,
	}
}
