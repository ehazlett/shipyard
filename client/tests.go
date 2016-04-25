package ilm_client

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/shipyard/shipyard/model"
	"io/ioutil"
	"net/http"
)

func GetTests(authHeader string, url string, projId string) ([]model.Test, int, error) {
	var tests []model.Test
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects/%s/tests", url, projId), "")
	if err != nil {
		return nil, resp.StatusCode, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &tests)
	if err != nil {
		return nil, resp.StatusCode, err
	}
	return tests, resp.StatusCode, nil
}

func GetTest(authHeader string, url string, projectId string, testId string) (*model.Test, int, error) {
	var test *model.Test
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/projects/%s/tests/%s", url, projectId, testId), "")
	if err != nil {
		return test, resp.StatusCode, err
	}

	// If we get an error status code we should not try to unmarshall body, since it will come empty from server.
	if resp.StatusCode != http.StatusOK {
		return nil, resp.StatusCode, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return test, resp.StatusCode, err
	}

	err = json.Unmarshal([]byte(body), &test)
	if err != nil {
		return test, resp.StatusCode, errors.New("Error, could not unmarshall project body")
	}
	return test, resp.StatusCode, nil
}

func CreateTest(authHeader string, url string, name string, description string, targets []*model.TargetArtifact, selectedTestType string, providerType string, providerName string, providerTest string, projectId string, params []*model.Parameter, successTag string, failTag string, fromTag string) (string, int, error) {
	var test *model.Test
	test = test.NewTest(name,
		description,
		targets,
		selectedTestType,
		projectId,
		providerType,
		providerName,
		providerTest,
		params,
		successTag,
		failTag,
		fromTag)

	data, err := json.Marshal(test)
	if err != nil {
		return "", 0, err
	}
	resp, err := sendRequest(authHeader, "POST", fmt.Sprintf("%s/api/projects/%s/tests", url, projectId), string(data))
	if err != nil {
		return "", resp.StatusCode, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", resp.StatusCode, err
	}

	apiResponse := &model.ApiResponse{}

	err = json.Unmarshal(body, &apiResponse)
	if err != nil {
		return "", resp.StatusCode, err
	}

	return apiResponse.ID, resp.StatusCode, nil

}

func UpdateTest(authHeader string, url string, testId string, name string, description string, targets []*model.TargetArtifact, selectedTestType string, projectId string, providerType string, providerName string, providerTest string, params []*model.Parameter, successTag string, failTag string, fromTag string) (int, error) {
	var test *model.Test
	test = test.NewTest(name,
		description,
		targets,
		selectedTestType,
		projectId,
		providerType,
		providerName,
		providerTest,
		params,
		successTag,
		failTag,
		fromTag)
	test.ID = testId
	data, err := json.Marshal(test)
	if err != nil {
		return 0, err
	}
	resp, err := sendRequest(authHeader, "PUT", fmt.Sprintf("%s/api/projects/%s/tests/%s", url, projectId, testId), string(data))

	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil
}

func DeleteTest(authHeader, url, projId string, testId string) (int, error) {
	resp, err := sendRequest(authHeader, "DELETE", fmt.Sprintf("%s/api/projects/%s/tests/%s", url, projId, testId), "")
	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil
}
