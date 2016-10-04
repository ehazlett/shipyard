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

type TagList struct {
  Name      string `json:name`
  Tags 		[]string `json:tags`
} 

type V1CompatLayer struct {
  V1Compatibility      string `json:v1Compatibility`
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

func (client *RegistryClient) doRequest(method string, path string, body []byte, headers map[string]string) ([]byte, error, http.Header) {
	b := bytes.NewBuffer(body)
	
	// Copy URL so that we can modify it
	var url url.URL

	url = *client.URL

	//Save the auth part if any
	credentials := url.User

	if credentials != nil {
		// Remove basic auth part if any temporarly
		url.User = nil
	}

	urlString := url.String()+"/v2"+path

	fmt.Println(urlString)

	req, err := http.NewRequest(method, urlString, b)
	if err != nil {
		return nil, err, nil
	}

	req.Header.Add("Content-Type", "application/json")
	if headers != nil {
		for header, value := range headers {
			req.Header.Add(header, value)
		}
	}

	//Add basic auth if any
	if credentials != nil {
		password, set := credentials.Password()

		if set {
			req.SetBasicAuth(credentials.Username(),password)
		}
	}

	resp, err := client.httpClient.Do(req)
	if err != nil {
		if !strings.Contains(err.Error(), "connection refused") && client.tlsConfig == nil {
			return nil, fmt.Errorf("%v. Are you trying to connect to a TLS-enabled daemon without TLS?", err), nil
		}
		return nil, err, nil
	}

	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err, nil
	}

	if resp.StatusCode == 404 {
		return nil, ErrNotFound, resp.Header
	}

	if resp.StatusCode >= 400 {
		return nil, Error{StatusCode: resp.StatusCode, Status: resp.Status, msg: string(data)}, resp.Header
	}

	return data, nil, resp.Header
}

func (client *RegistryClient) Search(query string, page int, numResults int) (*SearchResult, error) {
	if numResults < 1 {
		numResults = 100
	}

	data, err, _ := client.doRequest("GET", "/_catalog", nil, nil)
	if err != nil {
		return nil, err
	}

	// Filter out result based on query if any
	res := &SearchResult{}

	res.Query = query

	repos := []*Repository{}

	repoReq := map[string][]*string{}
	
	repoNames := []*string{}


	if err := json.Unmarshal(data, &repoReq); err != nil {
		return nil, err
	}

	if repoReq["repositories"] != nil {
		repoNames = repoReq["repositories"]
	} else {
		return res, nil
	}

	for _, repo := range repoNames {

		if len(query)==0 || strings.Contains(*repo, query) {
			r, err := client.Repository(*repo)
			if err != nil {
				return nil, err
			}

			repos = append(repos, r)
		}
		
	}

	res.Results = repos
	res.NumberOfResults = len(repos)


	return res, nil
}

func (client *RegistryClient) DeleteRepository(repo string) error {
	r, err := client.Repository(repo)

	if err != nil {
		return err
	}

	for _, layer := range r.Layers {
		uri := fmt.Sprintf("/%s/%s/blobs/%s", r.Namespace, r.Repository, layer.BlobSum)
		
		if _, err, _ := client.doRequest("DELETE", uri, nil, nil); err != nil {
			return err
		}
	}

	for _, tag := range r.Tags {
		uri := fmt.Sprintf("/%s/%s/manifests/%s", r.Namespace, r.Repository, tag)
		
		if _, err, _ := client.doRequest("DELETE", uri, nil, nil); err != nil {
			return err
		}
	}

	return nil
}

type Manifest struct {
  Name      		string `json:name`
  Tag 				string `json:tag`
  Architecture 		string `json:architecture`
  FsLayers 			[]Layer `json:fsLayers`
  History			[]*V1CompatLayer `json:history`
} 

func (client *RegistryClient) Repository(name string) (*Repository, error) {
	r := parseRepo(name)
	uri := fmt.Sprintf("/%s/%s/tags/list", r.Namespace, r.Repository)
	
	tagList := &TagList{}

	data, err, _ := client.doRequest("GET", uri, nil, nil)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, &tagList); err != nil {
		return nil, err
	}

	layers := []Layer{}
	tags := []Tag{}
	size := int64(0)

	for _, tag := range tagList.Tags {
		uri := fmt.Sprintf("/%s/%s/manifests/%s", r.Namespace, r.Repository, tag)
		manifest := &Manifest{}

		data, err , _:= client.doRequest("GET", uri, nil, nil)

		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(data, &manifest); err != nil {
			return nil, err
		}

		//For V2 only API we have use this code.
		/*for _, layer := range manifest.FsLayers {
			layer.ID = layer.BlobSum

			uri := fmt.Sprintf("/%s/%s/blobs/%s", r.Namespace, r.Repository, layer.ID)

			_ , err, headers := client.doRequest("HEAD", uri, nil, nil)

			if err != nil {
				return nil, err
			}

			sizeLayer, err := strconv.Atoi(headers.Get("Content-Length"))

			if err == nil {
				layer.Size = int64(sizeLayer)
				size += layer.Size
			}

			layer.Architecture = manifest.Architecture
			

			layers = append(layers, layer)
		}*/

		for idx, layerV1 := range manifest.History {
			layer := &Layer{}

			if err = json.Unmarshal([]byte(layerV1.V1Compatibility), &layer); err != nil {
			 	return nil, err
			}

			layer.BlobSum = manifest.FsLayers[idx].BlobSum
			
			size += layer.Size

			layers = append(layers, *layer)
		}


		tag := &Tag{
			ID:   tag,
			Name: tag,
		}

		tags = append(tags, *tag)
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
