package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func (a *Api) nodes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	nodes, err := a.manager.Nodes()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(nodes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) node(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	name := vars["name"]
	node, err := a.manager.Node(name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(node); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
