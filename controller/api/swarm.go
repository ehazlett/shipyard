package api

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"

	log "github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/model"
)

type AuthConfig struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Auth     string `json:"auth"`
	Email    string `json:"email"`
}

// authConfigB64 assembles the credentials needed for establishing a communication
// with the Docker Daemon. They are first marshaled as json, and then returned as a base64 encoded string.
func authConfigB64(username, password, auth, email string) (string, error) {
	authConfig := AuthConfig{
		Username: username,
		Password: password,
		Auth:     "",
		Email:    "",
	}

	authJson, err := json.Marshal(authConfig)
	log.Debugf("Marshal %s ./controller/api/swarm.go:authConfig", authJson)
	if err != nil {
		return "", err
	}

	authB64 := base64.StdEncoding.EncodeToString(authJson)

	return authB64, nil
}

// pingRegistry Performs a *ping* to a V2 registry by it's `/v2/` endpoint
// It returns true if the ping is successful.
// TODO: there are two pingRegistry() funcs one in API and another one in manager. Should refactor.
func pingRegistry(registry, username, password string) (bool, error) {
	registryEndpoint := registry + "/v2/"

	// TODO: Please note the trailing forward slash / which is needed for Artifactory, else you get a 404.
	req, err := http.NewRequest("GET", registryEndpoint, nil)
	log.Debugf("New Request to %s ./controller/api/swarm.go:pingRegistry", registryEndpoint)
	if err != nil {
		log.Debugf("Could not create request for %s ./controller/api/swarm.go:pingRegistry", registryEndpoint)
		return false, err
	}

	req.SetBasicAuth(username, password)

	// Create unsecured client
	trans := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	client := &http.Client{Transport: trans}

	resp, err := client.Do(req)
	log.Debugf("HTTP request to %s. Got %s ./controller/api/swarm.go:pingRegistry", registryEndpoint, resp.Status)
	if err != nil {
		log.Debugf("HTTP request to %s failed ./controller/api/swarm.go:pingRegistry", registryEndpoint)
		return false, err
	}

	if resp.StatusCode != 200 {
		return false, errors.New(resp.Status)
	}

	return true, nil
}

// findRegistry checks to see if a valid registry is embedded into imageName.
// It returns the hostname if it was found within imageName.
func (a *Api) findRegistry(imageName string) (*model.Registry, error) {
	possibleRegistry := strings.SplitN(imageName, "/", 2)[0]

	var registry *model.Registry

	if result, err := a.manager.RegistryByAddress("https://" + possibleRegistry); err == nil {
		registry = result
		log.Debugf("%s Registry found ./controller/api/swarm.go:findRegistry", registry.Addr)
	} else if result, err := a.manager.RegistryByAddress("http://" + possibleRegistry); err == nil {
		registry = result
		log.Debugf("%s Registry found ./controller/api/swarm.go:findRegistry", registry.Addr)
	} else {
		log.Debugf("%s Registry NOT found ./controller/api/swarm.go:findRegistry", possibleRegistry)
		return nil, errors.New("REGISTRY NOT IN DATABASE")
	}

	validRegistry, err := pingRegistry(registry.Addr, registry.Username, registry.Password)
	if err != nil {
		log.Debugf("Error while trying to ping %s ./controller/api/swarm.go:findRegistry", registry.Addr)
		return nil, err
	}

	if !validRegistry {
		log.Debugf("Registry %s is no longer valid ./controller/api/swarm.go:findRegistry", registry.Addr)
		return nil, errors.New("CAN'T PULL FROM INVALID REGISTRY")
	}

	return registry, nil
}

func (a *Api) swarmRedirect(w http.ResponseWriter, req *http.Request) {
	var err error
	req.URL, err = url.ParseRequestURI(a.dUrl)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: we should not be sending data in the headers.
	if imageName := req.Header.Get("Reg-Image-Name"); imageName != "" && strings.Count(imageName, "/") > 0 {
		registry, err := a.findRegistry(imageName)

		if err == nil {
			credentialsB64, err := authConfigB64(registry.Username, registry.Password, "", "")
			if err == nil {
				req.Header.Set("X-Registry-Auth", credentialsB64)
			} else {
				log.Debugf("Couldn't encode credentials for %s ./controller/api/swarm.go:swarmRedirect", registry.Addr)
			}
		} else {
			log.Debugf("%s Image name does not refer to registry ./controller/api/swarm.go:swarmRedirect", imageName)
		}
	}

	a.fwd.ServeHTTP(w, req)
}

type proxyWriter struct {
	Body       *bytes.Buffer
	Headers    *map[string][]string
	StatusCode *int
}

func (p proxyWriter) Header() http.Header {
	return *p.Headers
}
func (p proxyWriter) Write(data []byte) (int, error) {
	return p.Body.Write(data)
}
func (p proxyWriter) WriteHeader(code int) {
	*p.StatusCode = code
}
