package ilm_client

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/docker/engine-api/client"
	"github.com/docker/engine-api/types"
	"github.com/shipyard/shipyard/model"
	"golang.org/x/net/context"
	"io/ioutil"
	"net/http"
)

func GetLocalImages(url string) ([]types.Image, error) {

	defaultHeaders := map[string]string{"User-Agent": "engine-api-cli-1.0"}
	cli, err := client.NewClient(url, "", nil, defaultHeaders)
	if err != nil {
		return nil, err
	}

	images, err := cli.ImageList(context.Background(), types.ImageListOptions{All: true})

	return images, err
}

func GetImages(authHeader, url string) ([]model.Image, error) {
	var images []model.Image
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/ilm_images", url), "")
	if nil == err {
		defer resp.Body.Close()

		body, _ := ioutil.ReadAll(resp.Body)
		err = json.Unmarshal([]byte(body), &images)
		if err != nil {
			return images, err
		}
	} else {
		return images, err
	}
	return images, nil
}

func CreateImage(authHeader string, url string, name string, imageId string, tag string, ilmtags []string, description string, registryId string, location string, skipImageBuild bool, projectId string) (string, error) {

	var image *model.Image
	image = image.NewImage(name, imageId, tag, ilmtags, description, registryId, location, skipImageBuild, projectId)
	//make a request to create it
	data, err := json.Marshal(image)
	if err != nil {
		return "", err
	}
	resp, err := sendRequest(authHeader, "POST", fmt.Sprintf("%s/api/ilm_images", url), string(data))
	if err != nil {
		return "", err
	} else {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return "", err
		}
		err = json.Unmarshal(body, &image)
		if err != nil {
			return "", err
		} else {
			return image.ID, nil
		}
	}
}

func UpdateImage(authHeader string, url string, id string, name string, imageId string, tag string, ilmtags []string, description string, registryId string, location string, skipImageBuild bool, projectId string) error {

	var image *model.Image
	image = image.NewImage(name, imageId, tag, ilmtags, description, registryId, location, skipImageBuild, projectId)
	image.ID = id
	data, err := json.Marshal(image)
	if err != nil {
		return err
	}

	resp, err := sendRequest(authHeader, "PUT", fmt.Sprintf("%s/api/ilm_images/%s", url, id), string(data))
	if err != nil {
		return err
	}
	if resp.StatusCode != 200 { //not ok
		err = errors.New(resp.Status)
		return err
	}
	return nil
}

func GetImage(authHeader, url, id string) (model.Image, error) {
	var image model.Image
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/ilm_images/%s", url, id), "")
	if err != nil {
		return image, err
	} else {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return image, err
		}

		err = json.Unmarshal([]byte(body), &image)
		if err != nil {
			return image, err
		}
	}
	return image, nil
}

func DeleteImage(authHeader, url, id string) error {
	resp, err := sendRequest(authHeader, "DELETE", fmt.Sprintf("%s/api/ilm_images/%s", url, id), "")
	if err != nil {
		return err
	}
	if resp.StatusCode != http.StatusNoContent { //not ok
		err = errors.New(resp.Status)
		return err
	}
	return nil
}
