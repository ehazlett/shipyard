package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/auth"
)

func (a *Api) accounts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	accounts, err := a.manager.Accounts()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(accounts); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) saveAccount(w http.ResponseWriter, r *http.Request) {
	var account *auth.Account
	if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := a.manager.SaveAccount(account); err != nil {
		log.Errorf("error saving account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated account: name=%s", account.Username)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) account(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	account, err := a.manager.Account(username)
	if err != nil {
		log.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(account); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
func (a *Api) deleteAccount(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	account, err := a.manager.Account(username)
	if err != nil {
		log.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.DeleteAccount(account); err != nil {
		log.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted account: username=%s id=%s", account.Username, account.ID)
	w.WriteHeader(http.StatusNoContent)
}
