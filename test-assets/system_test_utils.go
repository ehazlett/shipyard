package test_assets

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os/exec"
	"time"
)

func bashExec(command string) string {
	cmd := command
	out, err := exec.Command("bash", "-c", cmd).Output()
	if err != nil {
		return fmt.Sprintf("Failed to execute command: %s", cmd)
	}
	return string(out)
}

func waitFor(url, username, password string, tlsSkipVerify bool) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		panic(err)
	}

	req.SetBasicAuth(username, password)

	var tlsConfig *tls.Config

	tlsConfig = nil

	if tlsSkipVerify {
		tlsConfig = &tls.Config{InsecureSkipVerify: true}
	}

	// Create unsecured client
	trans := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	client := &http.Client{Transport: trans}

	resp, err := client.Do(req)
	timeout := 180 //3 minutes timeout
	timer := 0
	for err != nil {
		if timer == timeout {
			fmt.Printf("time out connecting to %s\n", url)
			panic(err)
		}
		resp, err = client.Do(req)
		time.Sleep(1000 * time.Millisecond)
		timer += 1
	}

	status := resp.StatusCode

	if status == 401 {
		panic(fmt.Sprintf("%s returned code 401, unauthorized. Please check your username and password\n", url))
	}

	for status < 200 || status > 226 {
		resp, err = client.Do(req)
		if err != nil {
			panic(err)
		}
		status = resp.StatusCode
		time.Sleep(1000 * time.Millisecond)
	}
}

func fetchToken(url, user, pass string) string {
	token := struct {
		AuthToken string `json:"auth_token"`
	}{}

	credentials := []byte(fmt.Sprintf(`{"username": "%s", "password": "%s"}`, user, pass))

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(credentials))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &token)
	if err != nil {
		panic(err)
	}

	return token.AuthToken
}

func stringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}
