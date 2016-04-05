package dockerhub

type Tag struct {
	Layer string `json:"layer"`
	Name  string `json:"name"`
}