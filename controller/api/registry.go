package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard"
)

func (a *Api) registries(w http.ResponseWriter, r *http.Request) {
	registries, err := a.manager.Registries()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(registries); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) addRegistry(w http.ResponseWriter, r *http.Request) {
	var registry *shipyard.Registry
	if err := json.NewDecoder(r.Body).Decode(&registry); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := a.manager.AddRegistry(registry); err != nil {
		log.Errorf("error saving registry: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("added registry: name=%s", registry.Name)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) registry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["registryId"]

	registry, err := a.manager.Registry(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(registry); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) removeRegistry(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["registryId"]

	registry, err := a.manager.Registry(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := a.manager.RemoveRegistry(registry); err != nil {
		log.Errorf("error deleting registry: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) repositories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["registryId"]

	if id == "" {
		http.Error(w, "Please pass a valid id", http.StatusNotFound)
		return
	}
	registry, err := a.manager.Registry(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	repos, err := registry.Repositories()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(repos); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) repository(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["registryId"]
	repoName := vars["repo"]

	registry, err := a.manager.Registry(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	repo, err := registry.Repository(repoName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(repo); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) deleteRepository(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["registryId"]
	repoName := vars["repo"]

	registry, err := a.manager.Registry(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := registry.DeleteRepository(repoName); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
