package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
)

func (a *Api) getResults(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")
	vars := mux.Vars(r)
	projId := vars["projectId"]
	result, err := a.manager.GetResults(projId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(result); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) createResult(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projId := vars["projectId"]
	var result *model.Result
	if err := json.NewDecoder(r.Body).Decode(&result); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.CreateResult(projId, result); err != nil {
		log.Errorf("error saving result: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("saved result: id=%s", result.ID)
	w.WriteHeader(http.StatusCreated)
}

func (a *Api) updateResult(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	projId := vars["projectId"]
	resultId := vars["resultId"]

	result, err := a.manager.GetResult(projId, resultId)
	if err != nil {
		log.Errorf("error updating result: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&result); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.UpdateResult(projId, result); err != nil {
		log.Errorf("error updating result: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated result: id=%s", result.ID)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) getResult(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projId := vars["projectId"]
	resultId := vars["resultId"]

	result, err := a.manager.GetResult(projId, resultId)
	if err != nil {
		log.Errorf("error retrieving result: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(result); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) deleteResult(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projId := vars["projectId"]
	resultId := vars["resultId"]

	result, err := a.manager.GetResult(projId, resultId)
	if err != nil {
		log.Errorf("error deleting result: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := a.manager.DeleteResult(projId, resultId); err != nil {
		log.Errorf("error deleting result: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted result: id=%s", result.ID)
	w.WriteHeader(http.StatusNoContent)
}
