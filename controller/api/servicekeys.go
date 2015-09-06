package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/auth"
)

func (a *Api) addServiceKey(w http.ResponseWriter, r *http.Request) {
	var k *auth.ServiceKey
	if err := json.NewDecoder(r.Body).Decode(&k); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	key, err := a.manager.NewServiceKey(k.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("created service key key=%s description=%s", key.Key, key.Description)
	if err := json.NewEncoder(w).Encode(key); err != nil {
		log.Error(err)
	}
}

func (a *Api) serviceKeys(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	keys, err := a.manager.ServiceKeys()
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := json.NewEncoder(w).Encode(keys); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func (a *Api) removeServiceKey(w http.ResponseWriter, r *http.Request) {
	var key *auth.ServiceKey
	if err := json.NewDecoder(r.Body).Decode(&key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.RemoveServiceKey(key.Key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("removed service key %s", key.Key)
	w.WriteHeader(http.StatusNoContent)
}
