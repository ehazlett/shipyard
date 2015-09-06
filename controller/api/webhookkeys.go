package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/dockerhub"
)

func (a *Api) webhookKeys(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	keys, err := a.manager.WebhookKeys()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(keys); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) webhookKey(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	key, err := a.manager.WebhookKey(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) addWebhookKey(w http.ResponseWriter, r *http.Request) {
	var k *dockerhub.WebhookKey
	if err := json.NewDecoder(r.Body).Decode(&k); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	key, err := a.manager.NewWebhookKey(k.Image)
	if err != nil {
		log.Errorf("error generating webhook key: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("saved webhook key image=%s", key.Image)
	if err := json.NewEncoder(w).Encode(key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) deleteWebhookKey(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if err := a.manager.DeleteWebhookKey(id); err != nil {
		log.Errorf("error deleting webhook key: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("removed webhook key id=%s", id)
	w.WriteHeader(http.StatusNoContent)
}
