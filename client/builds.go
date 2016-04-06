package ilm_client

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/shipyard/shipyard/model"
	"io/ioutil"
	"net/http"
)

func GetBuilds(authHeader, url string, projectId string, testId string) ([]*model.Build, error) {
	var builds []*model.Build
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects/%s/tests/%s/builds", url, projectId, testId), "")
	if nil == err {
		defer resp.Body.Close()

		body, _ := ioutil.ReadAll(resp.Body)
		err = json.Unmarshal([]byte(body), &builds)
		if err != nil {
			return builds, err
		}
	} else {
		return builds, err
	}
	return builds, nil
}

func CreateBuild(authHeader string, url string, cfg *model.BuildConfig, status *model.BuildStatus, res []*model.BuildResult, testId string, projectId string) (string, int, error) {
	var build *model.Build
	build = build.NewBuild(cfg, status, res, testId, projectId)
	//make a request to create it
	data, err := json.Marshal(build)
	if err != nil {
		return "", 0, err
	}
	resp, err := sendRequest(authHeader, "POST", fmt.Sprintf("%s/api/projects/%s/tests/%s/builds", url, projectId, testId), string(data))
	if err != nil {
		return "", resp.StatusCode, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", resp.StatusCode, err
	}
	err = json.Unmarshal(body, &build)
	if err != nil {
		return "", resp.StatusCode, err
	} else {
		return build.ID, resp.StatusCode, nil
	}

}

func UpdateBuild(authHeader string, url string, projectId string, testId string, buildId string, cfg *model.BuildConfig, status *model.BuildStatus, res []*model.BuildResult) error {
	var build *model.Build
	build = build.NewBuild(cfg, status, res, testId, projectId)
	data, err := json.Marshal(build)
	if err != nil {
		return err
	}

	resp, err := sendRequest(authHeader, "PUT", fmt.Sprintf("%s/api/projects/%s/tests/%s/builds/%s", url, projectId, testId, buildId), string(data))
	if err != nil {
		return err
	}
	if resp.StatusCode != 200 { //not ok
		err = errors.New(resp.Status)
		return err
	}
	return nil
}

func GetBuild(authHeader, url, projectId string, testId string, buildId string) (*model.Build, int, error) {
	var build *model.Build
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects/%s/tests/%s/builds/%s", url, projectId, testId, buildId), "")
	if err != nil {
		return build, resp.StatusCode, err
	}

	// If we get an error status code we should not try to unmarshall body, since it will come empty from server.
	if resp.StatusCode != http.StatusOK {
		return nil, resp.StatusCode, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return build, resp.StatusCode, err
	}

	err = json.Unmarshal([]byte(body), &build)
	if err != nil {
		return build, resp.StatusCode, errors.New("Error, could not unmarshall build body")
	}

	return build, resp.StatusCode, nil
}

func DeleteBuild(authHeader, url, projectId string, testId string, buildId string) error {
	resp, err := sendRequest(authHeader, "DELETE", fmt.Sprintf("%s/api/projects/%s/tests/%s/builds/%s", url, projectId, testId, buildId), "")
	if err != nil {
		return err
	}
	if resp.StatusCode != http.StatusNoContent { //not ok
		err = errors.New(resp.Status)
		return err
	}
	return nil
}
