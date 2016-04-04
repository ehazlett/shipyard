package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
)

func (a *Api) getBuilds(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")
	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]
	builds, err := a.manager.GetBuilds(projId, testId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(builds); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) getBuild(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectId := vars["projectId"]
	testId := vars["testId"]
	buildId := vars["buildId"]

	build, err := a.manager.GetBuild(projectId, testId, buildId)
	if err != nil {
		log.Errorf("error retrieving build: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(build); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) createBuild(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]
	var build *model.Build

	if err := json.NewDecoder(r.Body).Decode(&build); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := a.manager.CreateBuild(projId, testId, build); err != nil {
		log.Errorf("error creating build: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("saved build: id=%s", build.ID)
	w.WriteHeader(http.StatusCreated)
}

func (a *Api) updateBuild(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]
	buildId := vars["buildId"]
	build, err := a.manager.GetBuild(projId, testId, buildId)
	if err != nil {
		log.Errorf("error updating build: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&build); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.UpdateBuild(projId, testId, buildId, build); err != nil {
		log.Errorf("error updating build: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated build: id=%s", build.ID)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) deleteBuild(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]
	buildId := vars["buildId"]

	build, err := a.manager.GetBuild(projId, testId, buildId)
	if err != nil {
		log.Errorf("error deleting build: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := a.manager.DeleteBuild(projId, testId, buildId); err != nil {
		log.Errorf("error deleting build: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted build: id=%s", build.ID)
	w.WriteHeader(http.StatusNoContent)
}
