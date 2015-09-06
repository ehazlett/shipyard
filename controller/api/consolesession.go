package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/nu7hatch/gouuid"
	"github.com/shipyard/shipyard"
)

func (a *Api) createConsoleSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	containerId := vars["container"]
	// generate token
	u4, err := uuid.NewV4()
	if err != nil {
		log.Errorf("error generating console session token: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	token := u4.String()

	cs := &shipyard.ConsoleSession{
		ContainerID: containerId,
		Token:       token,
	}

	if err := a.manager.CreateConsoleSession(cs); err != nil {
		log.Errorf("error creating console session: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(cs); err != nil {
		log.Errorf("error encoding console session: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("created console session: container=%s", cs.ContainerID)
}

func (a *Api) consoleSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	token := vars["token"]

	cs, err := a.manager.ConsoleSession(token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(cs); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) removeConsoleSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	token := vars["token"]

	cs, err := a.manager.ConsoleSession(token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := a.manager.RemoveConsoleSession(cs); err != nil {
		log.Errorf("error removing console session: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
