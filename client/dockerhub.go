package ilm_client

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/shipyard/shipyard/model/dockerhub"
)

func DockerHubSearchImage(authHeader, url string, imageName string) ([]dockerhub.Image, int, error) {
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/v1/search?q=%s", url, imageName), "")
	if err != nil {
		return nil, resp.StatusCode, err
	} else {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, resp.StatusCode, err
		}
		type results struct {
			Results []dockerhub.Image `json:"results"`
		}
		var r results
		err = json.Unmarshal(body, &r)
		if err != nil {
			return nil, resp.StatusCode, err
		} else {
			return r.Results, resp.StatusCode, nil
		}
	}
}

func DockerHubSearchImageTags(authHeader, url string, imageName string) ([]dockerhub.Tag, int, error) {
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/v1/repositories/tags?r=%s", url, imageName), "")
	if err != nil {
		return nil, resp.StatusCode, err
	} else {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, resp.StatusCode, err
		}
		var tags []dockerhub.Tag
		err = json.Unmarshal(body, &tags)
		if err != nil {
			return nil, resp.StatusCode, err
		} else {
			return tags, resp.StatusCode, nil
		}
	}
}
