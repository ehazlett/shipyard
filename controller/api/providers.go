package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
)

func (a *Api) getProviders(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	providers, err := a.manager.GetProviders()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(providers); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) createProvider(w http.ResponseWriter, r *http.Request) {

	var provider *model.Provider
	if err := json.NewDecoder(r.Body).Decode(&provider); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.CreateProvider(provider); err != nil {
		log.Errorf("error saving provider: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("saved provider: id=%s", provider.ID)
	w.WriteHeader(http.StatusCreated)
}
func (a *Api) updateProvider(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	providerId := vars["providerId"]

	provider, err := a.manager.GetProvider(providerId)
	if err != nil {
		log.Errorf("error updating provider: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&provider); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.UpdateProvider(provider); err != nil {
		log.Errorf("error updating provider: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated provider: id=%s", providerId)
	w.WriteHeader(http.StatusNoContent)
}
func (a *Api) getProvider(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	providerId := vars["providerId"]

	provider, err := a.manager.GetProvider(providerId)
	if err != nil {
		log.Errorf("error retrieving provider: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(provider); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) deleteProvider(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	providerId := vars["providerId"]

	provider, err := a.manager.GetProvider(providerId)
	if err != nil {
		log.Errorf("error deleting result: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := a.manager.DeleteProvider(providerId); err != nil {
		log.Errorf("error deleting result: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted provider: id=%s", provider.ID)
	w.WriteHeader(http.StatusNoContent)
}
func (a *Api) getJobsByProviderId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	providerId := vars["providerId"]

	jobs, err := a.manager.GetJobsByProviderId(providerId)
	if err != nil {
		log.Errorf("error retrieving jobs for provider: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(jobs); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
func (a *Api) addJobToProviderId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	providerId := vars["providerId"]

	var provider *model.Provider
	var job *model.ProviderJob
	if err := json.NewDecoder(r.Body).Decode(&provider); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.AddJobToProviderId(providerId, job); err != nil {
		log.Errorf("error saving image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("added job to provider provider: id=%s", provider.ID)
	w.WriteHeader(http.StatusCreated)
}
