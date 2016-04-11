package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

const server string = "http://localhost:8888"

var token string

func fetch_token() string {
	var user string = "admin"
	var pass string = "shipyard"
	token := struct {
		AuthToken string `json:"auth_token"`
	}{}
	credentials := []byte(fmt.Sprintf(`{"username": "%s", "password": "%s"}`, user, pass))

	req, err := http.NewRequest("POST", "http://localhost:8888/auth/login", bytes.NewBuffer(credentials))
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

	return user + ":" + token.AuthToken
}

func sendRequest(method, endpoint, data string) (*http.Response, error) {
	//data is a json string
	body := []byte(data)
	req, err := http.NewRequest(method, endpoint, bytes.NewBuffer(body))
	if nil != err {
		return nil, err
	}
	req.Header.Set("X-Access-Token", token)
	client := &http.Client{}
	//fmt.Printf("sending request with token (%s) and endpoint (%s)\n", token, endpoint)
	resp, err := client.Do(req)

	if nil != err {
		return nil, err
	}
	return resp, nil
}

func create_image(image, tag string) {
	json_data := fmt.Sprintf("{\"name\":\"%s\",\"tag\":\"%s\"}", image, tag)
	//fmt.Printf("trying to create image at %s/api/ilm_images\n", server)
	resp, err := sendRequest("POST", fmt.Sprintf("%s/api/ilm_images", server), json_data)
	if err != nil {
		fmt.Printf("error in getting response")
		return
	}
	if resp.StatusCode != 201 {
		fmt.Printf("got %d when creating image\n", resp.StatusCode)
	}
}

func create_project(name string) string {
	project := struct {
		ID string `json:"id"`
	}{}
	data := fmt.Sprintf("{\"name\":\"%s\"}", name)
	//fmt.Printf("trying to create image at %s/api/ilm_images\n", server)
	resp, err := sendRequest("POST", fmt.Sprintf("%s/api/projects", server), data)
	if err != nil {
		fmt.Printf("error in getting response")
		return err.Error()
	}
	if resp.StatusCode != 201 {
		fmt.Printf("got %d when creating project\n", resp.StatusCode)
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return string(resp.StatusCode)
	}

	//fmt.Printf("body = %s\n", string(body))
	err = json.Unmarshal(body, &project)
	if err != nil {
		return "error unmarshaling"
	} else {

		return project.ID
	}
}

func add_images(id, images string) {
	resp, err := sendRequest("PUT", fmt.Sprintf("%s/api/projects/%s", server, id), images)
	if err != nil {
		fmt.Printf("error in getting response")
		return
	}
	if resp.StatusCode != 204 {
		fmt.Printf("warning: got %d when adding images to project\n", resp.StatusCode)
	}
}

func analyze_project_images(id string) (string, error) {
	resp, err := sendRequest("POST", fmt.Sprintf("%s/api/test_images/%s", server, id), "")
	if err != nil {
		fmt.Printf("error in getting response")
		return "", err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return string(resp.StatusCode), err
	}
	if resp.StatusCode != 200 {
		fmt.Printf("warning: got %d when analyzing project images\n", resp.StatusCode)
	}
	return string(body), nil
}

func main() {
	//get token
	token = fetch_token()
	//fmt.Printf("token = %s\n", token)
	//create image
	create_image("marvambass/nginx-registry-proxy", "latest")

	//curl -H "X-Access-Token:admin:$shipyard_token" -d '{"name":"busybox","imageId":"busybox latest image","tag":"latest"}' -X POST  http://localhost:8888/api/ilm_images
	//curl -H "X-Access-Token:admin:$shipyard_token" -d '{"name":"alpine","imageId":"busybox latest image","tag":"latest"}' -X POST  http://localhost:8888/api/ilm_images
	//curl -H "X-Access-Token:admin:$shipyard_token" -d '{"name":"marvambass/nginx-registry-proxy","imageId":"good image","tag":"latest"}' -X POST  http://localhost:8888/api/ilm_images

	//create project
	proj_id := create_project("project A")
	//curl --verbose -H 'Content-Type: application/json' -H "X-Access-Token: admin:$shipyard_token" -X POST -d '{"name":"projectA"}' http://localhost:8888/api/projects

	//add images to project
	add_images(proj_id, "{\"images\":[{\"name\":\"marvambass/nginx-registry-proxy\",\"tag\":\"latest\"}]}")

	//view list of images
	//curl -H "X-Access-Token:admin:$shipyard_token" -X GET http://localhost:8888/api/ilm_images

	//analyze image with clair
	reports, err := analyze_project_images(proj_id)
	if err != nil {
		fmt.Printf("error:%s\n", err.Error())
	} else {
		fmt.Printf("%s\n", reports)
	}
}
