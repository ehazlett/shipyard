package v1

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
	"path"
	"strings"
	"time"
)

var (
	ErrNotFound        = errors.New("Not found")
	defaultHTTPTimeout = 30 * time.Second
)

type RegistryClient struct {
	URL        *url.URL
	tlsConfig  *tls.Config
	httpClient *http.Client
}

type Repo struct {
	Namespace  string
	Repository string
}

func parseRepo(repo string) Repo {
	namespace := "library"
	r := repo

	if strings.Index(repo, "/") != -1 {
		parts := strings.Split(repo, "/")
		namespace = parts[0]
		r = path.Join(parts[1:]...)
	}

	return Repo{
		Namespace:  namespace,
		Repository: r,
	}
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

func NewRegistryClient(registryUrl string, tlsConfig *tls.Config) (*RegistryClient, error) {
	u, err := url.Parse(registryUrl)
	if err != nil {
		return nil, err
	}
	httpClient := newHTTPClient(u, tlsConfig, defaultHTTPTimeout)
	return &RegistryClient{
		URL:        u,
		httpClient: httpClient,
		tlsConfig:  tlsConfig,
	}, nil
}

func (client *RegistryClient) doRequest(method string, path string, body []byte, headers map[string]string) ([]byte, error) {
	b := bytes.NewBuffer(body)

	req, err := http.NewRequest(method, client.URL.String()+"/v1"+path, b)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Content-Type", "application/json")
	if headers != nil {
		for header, value := range headers {
			req.Header.Add(header, value)
		}
	}

	resp, err := client.httpClient.Do(req)
	if err != nil {
		if !strings.Contains(err.Error(), "connection refused") && client.tlsConfig == nil {
			return nil, fmt.Errorf("%v. Are you trying to connect to a TLS-enabled daemon without TLS?", err)
		}
		return nil, err
	}

	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode == 404 {
		return nil, ErrNotFound
	}

	if resp.StatusCode >= 400 {
		return nil, Error{StatusCode: resp.StatusCode, Status: resp.Status, msg: string(data)}
	}

	return data, nil
}

func (client *RegistryClient) Search(query string, page int, numResults int) (*SearchResult, error) {
	if numResults < 1 {
		numResults = 100
	}
	uri := fmt.Sprintf("/search?q=%s&n=%d&page=%d", query, numResults, page)
	data, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		return nil, err
	}

	res := &SearchResult{}
	if err := json.Unmarshal(data, &res); err != nil {
		return nil, err
	}

	// convert the simple results to rich Repository results
	repos := []*Repository{}
	for _, repo := range res.Results {
		r, err := client.Repository(repo.Name)
		if err != nil {
			return nil, err
		}

		repos = append(repos, r)
	}

	res.Results = repos

	return res, nil
}

func (client *RegistryClient) DeleteRepository(repo string) error {
	r := parseRepo(repo)
	uri := fmt.Sprintf("/repositories/%s/%s/", r.Namespace, r.Repository)
	if _, err := client.doRequest("DELETE", uri, nil, nil); err != nil {
		return err
	}

	return nil
}

func (client *RegistryClient) DeleteTag(repo string, tag string) error {
	r := parseRepo(repo)
	uri := fmt.Sprintf("/repositories/%s/%s/tags/%s", r.Namespace, r.Repository, tag)
	if _, err := client.doRequest("DELETE", uri, nil, nil); err != nil {
		return err
	}

	return nil
}

func (client *RegistryClient) Layer(id string) (*Layer, error) {
	uri := fmt.Sprintf("/images/%s/json", id)
	data, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		return nil, err
	}

	layer := &Layer{}
	if err := json.Unmarshal(data, &layer); err != nil {
		return nil, err
	}

	return layer, nil
}

func (client *RegistryClient) Repository(name string) (*Repository, error) {
	r := parseRepo(name)
	uri := fmt.Sprintf("/repositories/%s/%s/tags", r.Namespace, r.Repository)
	repoTags := map[string]string{}

	data, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, &repoTags); err != nil {
		return nil, err
	}

	layers := []Layer{}
	tags := []Tag{}
	size := int64(0)

	for n, id := range repoTags {
		uri := fmt.Sprintf("/images/%s/json", id)
		layer := &Layer{}

		data, err := client.doRequest("GET", uri, nil, nil)
		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(data, &layer); err != nil {
			return nil, err
		}

		uri = fmt.Sprintf("/images/%s/ancestry", id)

		ancestry := []string{}

		data, err = client.doRequest("GET", uri, nil, nil)
		if err != nil {
			return nil, err
		}

		if err = json.Unmarshal(data, &ancestry); err != nil {
			return nil, err
		}

		tag := &Tag{
			ID:   id,
			Name: n,
		}

		tags = append(tags, *tag)
		layer.Ancestry = ancestry

		layers = append(layers, *layer)

		// parse ancestor layers
		for _, i := range ancestry {
			uri = fmt.Sprintf("/images/%s/json", i)
			l := &Layer{}

			data, err = client.doRequest("GET", uri, nil, nil)
			if err != nil {
				return nil, err
			}

			if err = json.Unmarshal(data, &l); err != nil {
				return nil, err
			}
			size += l.Size
			layers = append(layers, *l)
		}
	}

	return &Repository{
		Name:       path.Join(r.Namespace, r.Repository),
		Namespace:  r.Namespace,
		Repository: r.Repository,
		Tags:       tags,
		Layers:     layers,
		Size:       int64(size) / int64(len(tags)),
	}, nil
}
