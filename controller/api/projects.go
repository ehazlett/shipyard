package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
)

func (a *Api) projects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	projects, err := a.manager.Projects()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(projects); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// TODO: need to return 201 http status code instead of 204 on POST.
// TODO: split into different HTTP verbs (PUT, POST). PUT should go to /projects/{id}
// TODO: need to return 422 or 400 when the entity is already existing but a POST is requested.
func (a *Api) saveProject(w http.ResponseWriter, r *http.Request) {
	var project *model.Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := a.manager.SaveProject(project); err != nil {
		log.Errorf("error saving project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated project: name=%s", project.Name)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) project(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]

	project, err := a.manager.Project(name)
	if err != nil {
		log.Errorf("error deleting project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
func (a *Api) deleteProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]

	project, err := a.manager.Project(name)
	if err != nil {
		log.Errorf("error deleting project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.DeleteProject(project); err != nil {
		log.Errorf("error deleting project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted project: id=%s name=%s", project.ID, project.Name)
	w.WriteHeader(http.StatusNoContent)
}
