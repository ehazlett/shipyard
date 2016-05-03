package v2

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	log "github.com/Sirupsen/logrus"
)

var (
	ErrNotFound        = errors.New("Not found")
	defaultHTTPTimeout = 30 * time.Second
)

type RegistryClient struct {
	URL        *url.URL
	tlsConfig  *tls.Config
	httpClient *http.Client
	Username   string
	Password   string
}

type Repo struct {
	Namespace  string
	Repository string
}

type TagList struct {
	Tags []string `json:"tags"`
}

func newHTTPClient(u *url.URL, tlsConfig *tls.Config, timeout time.Duration) *http.Client {
	httpTransport := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	httpTransport.Dial = func(proto, addr string) (net.Conn, error) {
		return net.DialTimeout(proto, addr, timeout)
	}
	return &http.Client{Transport: httpTransport}
}

func NewRegistryClient(registryUrl string, tlsConfig *tls.Config, username string, password string) (*RegistryClient, error) {
	u, err := url.Parse(registryUrl)
	if err != nil {
		return nil, err
	}
	httpClient := newHTTPClient(u, tlsConfig, defaultHTTPTimeout)
	return &RegistryClient{
		URL:        u,
		httpClient: httpClient,
		tlsConfig:  tlsConfig,
		Username:   username,
		Password:   password,
	}, nil
}

func (client *RegistryClient) doRequest(method string, path string, body []byte, headers map[string]string) ([]byte, http.Header, error) {
	b := bytes.NewBuffer(body)

	req, err := http.NewRequest(method, client.URL.String()+"/v2"+path, b)
	log.Debugf("Method: %s   URL: %s", method, client.URL.String()+"/v2"+path)
	if err != nil {
		log.Debugf("Error on doRequest")
		return nil, nil, err
	}

	req.SetBasicAuth(client.Username, client.Password)

	req.Header.Add("Content-Type", "application/json")
	if headers != nil {
		for header, value := range headers {
			req.Header.Add(header, value)
		}
	}

	resp, err := client.httpClient.Do(req)
	if err != nil {
		if !strings.Contains(err.Error(), "connection refused") && client.tlsConfig == nil {
			return nil, nil, fmt.Errorf("%s. Are you trying to connect to a TLS-enabled daemon without TLS?", err)
		}
		log.Debugf("Connection refused")
		return nil, nil, err
	}

	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Debugf("Error on ioutil.ReadAll")
		return nil, nil, err
	}

	if resp.StatusCode == 404 {
		log.Debugf("Error on resp.StatusCode == 404")
		return nil, nil, ErrNotFound
	}

	if resp.StatusCode >= 400 {
		log.Debugf("Error on resp.StatusCode >= 400")
		return nil, nil, Error{StatusCode: resp.StatusCode, Status: resp.Status, msg: string(data)}
	}

	return data, resp.Header, nil
}

func (client *RegistryClient) Search(query string) ([]*Repository, error) {
	type repo struct {
		Repositories []string `json:"repositories"`
	}

	uri := fmt.Sprintf("/_catalog")
	data, _, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		log.Debugf("Error on client.doRequest(GET, uri, nil, nil)")
		return nil, err
	}

	log.Debugf("Response from /_catalog %s", string(data))

	res := &repo{}
	if err := json.Unmarshal(data, &res); err != nil {
		log.Debugf("Error on json.Unmarshal(data, &res)")
		return nil, err
	}

	log.Debugf("Repos %v", res)

	repos := []*Repository{}

	// simple filter for list
	for _, k := range res.Repositories {
		if strings.Index(k, query) == 0 {
			tl, err := client.getTags(k)
			if err != nil {
				msg := fmt.Sprintf("Error on getting tags: %s", err.Error())
				log.Error(msg)
				repos = append(repos, &Repository{
					Name:         k,
					Tag:          "",
					HasProblems:  true,
					Architecture: "",
					RegistryUrl:  client.URL.String(),
					Message:      msg,
				})
				// TODO: it is ok to skip, but we should provide information to client about this.
				continue
			}

			for _, t := range tl.Tags {
				// get the repository and append to the slice
				r, err := client.Repository(client.URL.String(), k, t)
				if err != nil {
					log.Errorf("There was a problem when getting the manifest from %s/%s, error = %s", k, t, err.Error())
				}

				// Add the repo even if there was an error, so that we know that it exists.
				// The repo will just have name, tag, and mark some other fields as invalid.
				repos = append(repos, r)
			}
		}
	}

	return repos, nil
}

func (client *RegistryClient) DeleteRepository(repo string) error {
	tl, err := client.getTags(repo)
	if err != nil {
		return err
	}

	for _, t := range tl.Tags {
		// remove tag
		if err := client.DeleteTag(repo, t); err != nil {
			return err
		}
	}

	return nil
}

func (client *RegistryClient) DeleteTag(repo string, tag string) error {
	r, err := client.Repository(client.URL.String(), repo, tag)
	if err != nil {
		return err
	}

	uri := fmt.Sprintf("/%s/manifests/%s", repo, r.Digest)
	if _, _, err := client.doRequest("DELETE", uri, nil, nil); err != nil {
		return err
	}

	return nil
}

func (client *RegistryClient) Repository(registryUrl, name, tag string) (*Repository, error) {
	if tag == "" {
		tag = "latest"
	}

	invalidRepository := &Repository{
		Name:         name,
		Tag:          tag,
		HasProblems:  true,
		Architecture: "",
		RegistryUrl:  registryUrl,
	}

	uri := fmt.Sprintf("/%s/manifests/%s", name, tag)

	log.Infof("requesting manifest for %s", uri)
	data, hdr, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		invalidRepository.Message = fmt.Sprintf("Error when getting manifest for %s, error = %s", uri, err.Error())
		log.Error(invalidRepository.Message)
		return invalidRepository, err
	}

	repo := &Repository{}
	if err := json.Unmarshal(data, &repo); err != nil {
		invalidRepository.Message = fmt.Sprintf("Error when binding manifests for %s, error = %s", uri, err.Error())
		log.Error(invalidRepository.Message)
		return invalidRepository, err
	}

	repo.RegistryUrl = registryUrl
	repo.Digest = hdr.Get("Docker-Content-Digest")
	log.Infof("Got docker content digest %s", repo.Digest)
	return repo, nil
}

func (client *RegistryClient) getTags(repo string) (*TagList, error) {
	uri := fmt.Sprintf("/%s/tags/list", repo)
	data, _, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		log.Errorf("There was an error when requesting tags for %s, error = %s", uri, err.Error())
		return nil, err
	}

	log.Debugf("Tags received %s", string(data))
	tl := &TagList{}
	if err := json.Unmarshal(data, &tl); err != nil {
		return nil, err
	}

	return tl, nil
}
