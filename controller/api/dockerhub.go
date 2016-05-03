package api

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

// dockerhub forward POC
func (a *Api) dockerhubSearch(w http.ResponseWriter, r *http.Request) {
	// TODO: make an actual proxy using the `github.com/mailgun/oxy/forward` package (note: client cannot change host during forwarding)
	w.Header().Set("content-type", "application/json")

	query := r.URL.Query().Get("q")
	fmt.Printf("query:" + query)

	response, err := http.Get("https://index.docker.io/v1/search?q=" + query)
	if err != nil {
		http.Error(w, err.Error(), response.StatusCode)
		return
	}

	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		http.Error(w, err.Error(), response.StatusCode)
		return
	}

	w.Write(contents)
}

// get the tags of an image from dockerhub
func (a *Api) dockerhubTags(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	repo := r.URL.Query().Get("r")

	response, err := http.Get("https://registry.hub.docker.com/v1/repositories/" + repo + "/tags")
	if err != nil {
		http.Error(w, err.Error(), response.StatusCode)
		return
	}

	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		http.Error(w, err.Error(), response.StatusCode)
		return
	}

	w.Write(contents)
}
