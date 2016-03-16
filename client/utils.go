package ilm_client

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
)

func fetchToken(url, user, pass string) (string, error) {
	token := struct {
		AuthToken string `json:"auth_token"`
	}{}

	credentials := []byte(fmt.Sprintf(`{"username": "%s", "password": "%s"}`, user, pass))

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(credentials))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal([]byte(body), &token)
	if err != nil {
		return "", err
	}
	if resp.StatusCode != 200 {
		return "", errors.New("Problem getting token")
	}
	return token.AuthToken, nil
}

func sendRequest(authheader, method, endpoint, data string) (*http.Response, error) {
	//data is a json string

	var body io.Reader

	if data == "" {
		body = nil
	} else {
		body = bytes.NewBuffer([]byte(data))
	}

	req, err := http.NewRequest(method, endpoint, body)
	if nil != err {
		return nil, err
	}
	req.Header.Set("X-Access-Token", authheader)
	client := &http.Client{}
	resp, err := client.Do(req)

	if nil != err {
		return nil, err
	}
	return resp, nil
}
