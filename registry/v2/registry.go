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

func (client *RegistryClient) doRequest(method string, path string, body []byte, headers map[string]string) ([]byte, http.Header, error) {
	b := bytes.NewBuffer(body)

	req, err := http.NewRequest(method, client.URL.String()+"/v2"+path, b)
	if err != nil {
		return nil, nil, err
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
			return nil, nil, fmt.Errorf("%s. Are you trying to connect to a TLS-enabled daemon without TLS?", err)
		}
		return nil, nil, err
	}

	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, err
	}

	if resp.StatusCode == 404 {
		return nil, nil, ErrNotFound
	}

	if resp.StatusCode >= 400 {
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
		return nil, err
	}

	res := &repo{}
	if err := json.Unmarshal(data, &res); err != nil {
		return nil, err
	}

	repos := []*Repository{}

	// simple filter for list
	for _, k := range res.Repositories {
		if strings.Index(k, query) == 0 {
			tl, err := client.getTags(k)
			if err != nil {
				return nil, err
			}

			for _, t := range tl.Tags {
				// get the repository and append to the slice
				r, err := client.Repository(k, t)
				if err != nil {
					// the registry will still list the tag after it has been deleted
					// so ignore for now
					if err == ErrNotFound {
						continue
					}
					return nil, err
				}

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
	r, err := client.Repository(repo, tag)
	if err != nil {
		return err
	}

	uri := fmt.Sprintf("/%s/manifests/%s", repo, r.Digest)
	if _, _, err := client.doRequest("DELETE", uri, nil, nil); err != nil {
		return err
	}

	return nil
}

func (client *RegistryClient) Repository(name, tag string) (*Repository, error) {
	if tag == "" {
		tag = "latest"
	}

	uri := fmt.Sprintf("/%s/manifests/%s", name, tag)

	data, hdr, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		return nil, err
	}

	repo := &Repository{}
	if err := json.Unmarshal(data, &repo); err != nil {
		return nil, err
	}

	repo.Digest = hdr.Get("Docker-Content-Digest")
	return repo, nil
}

func (client *RegistryClient) getTags(repo string) (*TagList, error) {
	uri := fmt.Sprintf("/%s/tags/list", repo)
	data, _, err := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		return nil, err
	}

	tl := &TagList{}
	if err := json.Unmarshal(data, &tl); err != nil {
		return nil, err
	}

	return tl, nil
}
