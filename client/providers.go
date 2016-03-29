package ilm_client

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/shipyard/shipyard/model"
	"go/types"
	"io/ioutil"
	"net/http"
)

func GetProviders(authHeader, url string) ([]model.Provider, int, error) {
	var providers []model.Provider
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/providers", url), "")
	if err != nil {
		return nil, resp.StatusCode, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &providers)
	if err != nil {
		return nil, resp.StatusCode, err
	}
	return providers, resp.StatusCode, nil
}

func GetProvider(authHeader, url, providerId string) (*model.Provider, int, error) {
	var provider *model.Provider
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/providers/%s", url, providerId), "")
	if err != nil {
		return provider, resp.StatusCode, err
	}

	// If we get an error status code we should not try to unmarshall body, since it will come empty from server.
	if resp.StatusCode != http.StatusOK {
		return nil, resp.StatusCode, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return provider, resp.StatusCode, err
	}

	err = json.Unmarshal([]byte(body), &provider)
	if err != nil {
		return provider, resp.StatusCode, errors.New("Error, could not unmarshall provider body")
	}
	return provider, resp.StatusCode, nil
}

func CreateProvider(authHeader string, url string, name string, availableJobTypes types.Array, config types.Object, provUrl string, providerJobs []*model.ProviderJob) (string, int, error) {
	var provider *model.Provider
	provider = provider.NewProvider(name, availableJobTypes, config, provUrl, providerJobs)

	data, err := json.Marshal(provider)
	if err != nil {
		return "", 0, err
	}

	resp, err := sendRequest(authHeader, "POST", fmt.Sprintf("%s/api/providers", url), string(data))
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

func UpdateProvider(authHeader string, url string, name string, providerId string, availableJobTypes types.Array, config types.Object, provUrl string, providerJobs []*model.ProviderJob) (int, error) {
	var provider *model.Provider
	provider = provider.NewProvider(name, availableJobTypes, config, provUrl, providerJobs)
	provider.ID = providerId
	data, err := json.Marshal(provider)
	if err != nil {
		return 0, err
	}
	resp, err := sendRequest(authHeader, "PUT", fmt.Sprintf("%s/api/providers/%s", url, providerId), string(data))

	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil
}

func DeleteProvider(authHeader, url, providerId string) (int, error) {
	resp, err := sendRequest(authHeader, "DELETE", fmt.Sprintf("%s/api/providers/%s", url, providerId), "")
	if err != nil {
		return resp.StatusCode, err
	}
	return resp.StatusCode, nil
}
func AddProviderJob(authHeader, url, providerId string, job *model.ProviderJob) (int, error) {

	if job == nil {
		return 0, errors.New(fmt.Sprintf("Cannot add a nil job to provider %s", providerId))
	}

	data, err := json.Marshal(job)

	if err != nil {
		return 0, err
	}

	resp, err := sendRequest(authHeader, "POST", fmt.Sprintf("%s/api/providers/%s/jobs", url, providerId), string(data))

	return resp.StatusCode, err
}

func GetProviderJobs(authHeader, url string, providerId string) ([]*model.ProviderJob, int, error) {
	var jobs []*model.ProviderJob
	resp, err := sendRequest(authHeader, "GET", fmt.Sprintf("%s/api/providers/%s/jobs", url, providerId), "")
	if nil != err {
		return jobs, resp.StatusCode, err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &jobs)
	if err != nil {
		return jobs, resp.StatusCode, err
	}
	return jobs, resp.StatusCode, nil
}
