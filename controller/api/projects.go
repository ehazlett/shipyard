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

func (a *Api) saveProject(w http.ResponseWriter, r *http.Request) {

	var project *model.Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := a.manager.SaveProject(project); err != nil {
		log.Errorf("error saving project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	//Now also includes the project id in the log
	log.Debugf("saved project: id=%s name=%s", project.ID, project.Name)

	// Just return the id for the Project that was created.
	tempResponse := map[string]string{
		"id": project.ID,
	}

	jsonResponse, err := json.Marshal(tempResponse)

	if err != nil {
		// TODO: if the Project was created but the response failed, should it be a 204?
		// Most probably a 400 BadRequest would be sufficient
		http.Error(w, err.Error(), http.StatusNoContent)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonResponse)
	return
}

func (a *Api) updateProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	project, err := a.manager.Project(id)
	if err != nil {
		log.Errorf("error updating project: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.UpdateProject(project); err != nil {
		log.Errorf("error updating project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated project: name=%s", project.Name)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) project(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	project, err := a.manager.Project(id)
	if err != nil {
		log.Errorf("error retrieving project: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) deleteProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	project, err := a.manager.Project(id)
	if err != nil {
		log.Errorf("error deleting project: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
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
