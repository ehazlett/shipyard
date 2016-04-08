package api

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
	"net/http"
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
func (a *Api) getBuildStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectId := vars["projectId"]
	testId := vars["testId"]
	buildId := vars["buildId"]

	buildStatus, err := a.manager.GetBuildStatus(projectId, testId, buildId)
	if err != nil {
		log.Errorf("error retrieving build status: %s", err)
		return
	}

	if err := json.NewEncoder(w).Encode(buildStatus); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) createBuild(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]
	action := vars["action"]
	var build *model.Build
	var status *model.BuildStatus
	if err := json.NewDecoder(r.Body).Decode(&build); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	//hardcode action to start, temporarily
	//this needs to be removed before going to production
	action = "start"
	buildAction := status.NewBuildAction(action)

	if err := a.manager.CreateBuild(projId, testId, build, buildAction); err != nil {
		log.Errorf("error creating build: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("saved build: id=%s", build.ID)
	tempResponse := map[string]string{
		"id": build.ID,
	}

	jsonResponse, err := json.Marshal(tempResponse)

	if err != nil {
		http.Error(w, err.Error(), http.StatusNoContent)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonResponse)
	return
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
