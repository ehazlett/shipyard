package test_assets

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	//"github.com/samalba/dockerclient"
	"github.com/stretchr/testify/assert"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"testing"
)

var (
	HOSTIP string

	REG     string
	REGPORT string
	REGUSER string
	REGPASS string
	REGNAME string

	SYAPI        string
	SYUSER       string
	SYPASS       string
	SYTOKEN      string
	SYACCESSHEAD string
)

func init() {
	// Get the docker daemon's IP for referencing registry services
	HOSTIP = strings.TrimSpace(bashExec("route|grep default|awk '{print $2}'"))

	// Append the daemon's proxy to no_proxy
	err := os.Setenv("no_proxy", "$no_proxy,"+HOSTIP)
	if err != nil {
		panic(err)
	}

	if REGPORT = os.Getenv("REGPORT"); REGPORT == "" {
		panic("REG_PORT not found!")
	}
	if REGUSER = os.Getenv("REGUSER"); REGUSER == "" {
		panic("REGUSER not found!")
	}
	if REGPASS = os.Getenv("REGPASS"); REGPASS == "" {
		panic("REGPASS not found!")
	}

	REGNAME = "registry"

	REG = fmt.Sprintf("https://%s:%s", HOSTIP, REGPORT)
	waitFor(REG+"/v2/", REGUSER, REGPASS, true)

	SYAPI = fmt.Sprintf("http://%s:8888", HOSTIP)
	SYUSER = "admin"
	SYPASS = "shipyard"
	fmt.Printf("waiting...\n")
	waitFor(SYAPI, "", "", true)
	fmt.Printf("done waiting...\n")
	SYTOKEN = fetchToken(SYAPI+"/auth/login", SYUSER, SYPASS)
	SYACCESSHEAD = SYUSER + ":" + SYTOKEN
}

func TestApiAccounts(t *testing.T) {
	endpoint := "/api/accounts"
	assumption := "admin"

	accounts := []struct {
		Username string `json:"username"`
	}{}

	req, err := http.NewRequest("GET", SYAPI+endpoint, nil)
	if err != nil {
		panic(err)
	}
	req.Header.Set("X-Access-Token", SYACCESSHEAD)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &accounts)
	if err != nil {
		panic(err)
	}

	admin := accounts[0].Username

	assert.Equal(t, assumption, admin, "Admin user does not exist in shipyard")
}

//The docker daemon will respond with a stream of json objects.
//We're using a decoder to deal with the stream.
// TODO: defer a function that performs clean up
func TestPullImageFromDockerhub(t *testing.T) {
	image := "busybox"
	endpoint := "/images/create?fromImage=" + image
	method := "POST"
	assumption := "Pulling " + image + "... : downloaded"

	pullResponse := struct {
		Status string `json:"status"`
	}{}

	req, err := http.NewRequest(method, SYAPI+endpoint, nil)
	if err != nil {
		panic(err)
	}
	req.Header.Set("X-Access-Token", SYACCESSHEAD)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	decoder := json.NewDecoder(resp.Body)
	// Only keep the last json object in the stream
	for {
		if err := decoder.Decode(&pullResponse); err == io.EOF {
			break
		} else if err != nil {
			panic(err)
		}
	}

	status := fmt.Sprintf("Pulling %s... : downloaded", image)

	assert.Equal(t, assumption, status, "Could not pull image from dockerhub")
}

func TestAddRegistry(t *testing.T) {
	endpoint := "/api/registries"
	method := "POST"
	name := REGNAME
	addr := REG
	username := REGUSER
	password := REGPASS
	tls := "true"
	data := fmt.Sprintf(`{"name":"%s","addr":"%s","username":"%s","password":"%s","tls_skip_verify":%s}`, name, addr, username, password, tls)

	req, err := http.NewRequest(method, SYAPI+endpoint, bytes.NewBuffer([]byte(data)))
	if err != nil {
		panic(err)
	}
	req.Header.Set("X-Access-Token", SYACCESSHEAD)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	assert.Equal(t, resp.StatusCode, 204, "V2 registry cannot be added to shipyard")
}

func TestListRegistries(t *testing.T) {
	endpoint := "/api/registries"
	expectedAddresses := []string{REG}
	method := "GET"

	registries := []struct {
		Addr string `json:"addr"`
	}{}

	req, err := http.NewRequest(method, SYAPI+endpoint, nil)
	if err != nil {
		panic(err)
	}
	req.Header.Set("X-Access-Token", SYACCESSHEAD)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &registries)
	if err != nil {
		panic(err)
	}

	for _, registry := range registries {
		result := stringInSlice(registry.Addr, expectedAddresses)
		errorMsg := fmt.Sprintf("Registry %s was not expected", registry.Addr)
		assert.Equal(t, result, true, errorMsg)
	}
}

//The docker daemon will respond with a stream of json objects.
//We're using a decoder to deal with the stream.
// TODO: defer a function that performs clean up
// TODO: find a better way of asserting failure.
//    Right now we're asserting the status of the last json object of stream.
//    This *last* json object may never arrive and it may not necessarily mean failure.

//The docker daemon will respond with a stream of json objects.
//We're using a decoder to deal with the stream.
// TODO: defer a function that performs clean up

func TestViewImageCatalog(t *testing.T) {
	endpoint := "/api/registries/" + REGNAME + "/repositories"
	method := "GET"
	req, err := http.NewRequest(method, SYAPI+endpoint, nil)
	if err != nil {
		panic(err)
	}
	req.Header.Set("X-Access-Token", SYACCESSHEAD)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	assert.Equal(t, 200, resp.StatusCode, "Unable to access image catalog")
}

func TestRemoveRegistry(t *testing.T) {
	endpoint := "/api/registries/" + REGNAME
	method := "DELETE"

	req, err := http.NewRequest(method, SYAPI+endpoint, nil)
	if err != nil {
		panic(err)
	}
	req.Header.Set("X-Access-Token", SYACCESSHEAD)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	assert.Equal(t, resp.StatusCode, 200, "V2 registry cannot be removed from shipyard")
}

func TestBadCredentials(t *testing.T) {
	//Note: this test is not for shipyard but for the registries
	req, err := http.NewRequest("GET", REG+"/v2/", nil)
	if err != nil {
		panic(err)
	}

	req.SetBasicAuth("incorrectuser", "incorrectpassword")

	var tlsConfig *tls.Config

	tlsConfig = nil

	// insecured for now
	tlsConfig = &tls.Config{InsecureSkipVerify: true}

	// Create unsecured client

	trans := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	client := &http.Client{Transport: trans}

	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	assert.Equal(t, 401, resp.StatusCode, "Invalid credentials were accepted")
}

func TestTLSCheckOnInsecureRegistry(t *testing.T) {
	//assuming the available registries are insecure
	endpoint := "/api/registries"
	method := "POST"
	name := REGNAME
	addr := REG
	username := REGUSER
	password := REGPASS
	tls := "false"
	data := fmt.Sprintf(`{"name":"%s","addr":"%s","username":"%s","password":"%s","tls_skip_verify":%s}`, name, addr, username, password, tls)

	req, err := http.NewRequest(method, SYAPI+endpoint, bytes.NewBuffer([]byte(data)))
	if err != nil {
		panic(err)
	}
	req.Header.Set("X-Access-Token", SYACCESSHEAD)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	assert.Equal(t, 500, resp.StatusCode, "Insecure registry allowed when InsecureSkipVerify is disabled")

}
