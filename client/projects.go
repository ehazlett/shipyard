package ilm_client

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/shipyard/shipyard/model"
	"io/ioutil"
	"net/http"
	"time"
)

func GetAuthToken(url, user, pass string) (string, error) {
	token, err := fetchToken(fmt.Sprintf("%s/auth/login", url), user, pass)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s:%s", user, token), err
}

func GetProjects(authHeader, url string) ([]model.Project, int, error) {
	var projects []model.Project
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects", url), "")
	if err != nil {
		return nil, resp.StatusCode, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &projects)
	if err != nil {
		return nil, resp.StatusCode, err
	}
	return projects, resp.StatusCode, nil
}

func CreateProject(authHeader string, url string, name string, description string, status string, images []*model.Image, tests []*model.Test, needsBuild bool) (string, int, error) {
	var project *model.Project
	timestamp := time.Now()
	project = project.NewProject(name, description, status, images, tests, needsBuild, timestamp, timestamp, timestamp, "", "")

	data, err := json.Marshal(project)
	if err != nil {
		return "", 0, err
	}
	resp, err := sendRequest(authHeader, "POST", fmt.Sprintf("%s/api/projects", url), string(data))
	if err != nil {
		return "", resp.StatusCode, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", resp.StatusCode, err
	}
	err = json.Unmarshal(body, &project)
	if err != nil {
		return "", resp.StatusCode, err
	} else {
		return project.ID, resp.StatusCode, nil
	}

}

func GetProject(authHeader, url, id string) (*model.Project, int, error) {
	var project *model.Project
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects/%s", url, id), "")
	if err != nil {
		return project, resp.StatusCode, err
	}

	// If we get an error status code we should not try to unmarshall body, since it will come empty from server.
	if resp.StatusCode != http.StatusOK {
		return nil, resp.StatusCode, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return project, resp.StatusCode, err
	}

	err = json.Unmarshal([]byte(body), &project)
	if err != nil {
		return project, resp.StatusCode, errors.New("Error, could not unmarshall project body")
	}

	return project, resp.StatusCode, nil
}

func UpdateProject(authHeader string, url string, id string, name string, description string, status string, images []*model.Image, tests []*model.Test, needsBuild bool) (int, error) {

	//create the project
	var project *model.Project
	var never time.Time //empty time stamp
	project = project.NewProject(name, description, status, images, tests, needsBuild, never, never, never, "", "")
	project.ID = id
	data, err := json.Marshal(project)
	if err != nil {
		return 0, err
	}
	resp, err := sendRequest(authHeader, "PUT", fmt.Sprintf("%s/api/projects/%s", url, id), string(data))
	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil
}

func DeleteProject(authHeader, url, id string) (int, error) {
	resp, err := sendRequest(authHeader, "DELETE", fmt.Sprintf("%s/api/projects/%s", url, id), "")
	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil
}

func AddProjectImage(authHeader, url, projectId string, name string, imageId string, tag string, ilmtags []string, description string, registryId string, location string, skipImageBuild bool) (int, error) {

	var image *model.Image
	newImage := image.NewImage(name, imageId, tag, ilmtags, description, registryId, location, skipImageBuild, projectId)

	data, err := json.Marshal(newImage)
	if err != nil {
		return 0, err
	}

	resp, err := sendRequest(authHeader, "POST", fmt.Sprintf("%s/api/projects/%s/images", url, projectId), string(data))

	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil

}

func GetProjectImages(authHeader, url string, projectId string) ([]*model.Image, int, error) {
	var images []*model.Image
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects/%s/images", url, projectId), "")
	if nil != err {
		return images, resp.StatusCode, err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &images)
	if err != nil {
		return images, resp.StatusCode, err
	}
	return images, resp.StatusCode, nil
}

func GetProjectImage(authHeader, url, projectId string, imageId string) (model.Image, int, error) {
	var image model.Image
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects/%s/images/%s", url, projectId, imageId), "")
	if err != nil {
		return image, resp.StatusCode, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return image, resp.StatusCode, err
	}

	err = json.Unmarshal([]byte(body), &image)
	if err != nil {
		return image, resp.StatusCode, err
	}

	return image, resp.StatusCode, nil
}

func DeleteProjectImage(authHeader, url, projectId string, imageId string) (int, error) {
	resp, err := sendRequest(authHeader, "DELETE", fmt.Sprintf("%s/api/projects/%s/images/%s", url, projectId, imageId), "")
	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil
}
