package model

type Image struct {
	ID      string `json:"id" gorethink:"id"`
	Name    string `json:"name" gorethink:"name"`
	ImageId string `json:"imageId" gorethink:"imageId"`
}
