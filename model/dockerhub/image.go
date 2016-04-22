package dockerhub

type Image struct {
	Is_automated bool   `json:"is_automated"`
	Name         string `json:"name"`
	Is_trusted   bool   `json:"is_trusted"`
	Is_official  bool   `json:"is_official"`
	Star_count   int64  `json:"star_count"`
	Description  string `json:"description"`
}
