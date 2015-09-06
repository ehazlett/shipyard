package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func (a *Api) roles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	roles, err := a.manager.Roles()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(roles); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) role(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	name := vars["name"]
	role, err := a.manager.Role(name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
