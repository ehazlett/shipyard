package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	log "github.com/Sirupsen/logrus"
)

func (a *Api) events(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	limit := -1
	l := r.FormValue("limit")
	if l != "" {
		lt, err := strconv.Atoi(l)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		limit = lt
	}
	events, err := a.manager.Events(limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(events); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) purgeEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	if err := a.manager.PurgeEvents(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Info("cluster events purged")
	w.WriteHeader(http.StatusNoContent)
}
