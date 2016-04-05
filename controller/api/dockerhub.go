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

	response, _ := http.Get("https://index.docker.io/v1/search?q=" + query)
	defer response.Body.Close()
	contents, _ := ioutil.ReadAll(response.Body)

	fmt.Fprintf(w, string(contents))
}

// get the tags of an image from dockerhub
func (a *Api) dockerhubTags(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	repo := r.URL.Query().Get("r")
	fmt.Printf("repo:" + repo)

	response, _ := http.Get("https://registry.hub.docker.com/v1/repositories/" + repo + "/tags")
	defer response.Body.Close()
	contents, _ := ioutil.ReadAll(response.Body)
	fmt.Fprintf(w, string(contents))
}
