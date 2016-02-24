package api

import (
	"encoding/json"
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
)

func (a *Api) images(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	images, err := a.manager.Images()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(images); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) saveImage(w http.ResponseWriter, r *http.Request) {
	var image *model.Image
	if err := json.NewDecoder(r.Body).Decode(&image); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.SaveImage(image); err != nil {
		log.Errorf("error saving image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("saved image: name=%s", image.Name)
	w.WriteHeader(http.StatusCreated)
}
func (a *Api) updateImage(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	id := vars["id"]

	image, err := a.manager.Image(id)
	if err != nil {
		log.Errorf("error updating image: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&image); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.UpdateImage(image); err != nil {
		log.Errorf("error updating image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated image: name=%s", image.Name)
	w.WriteHeader(http.StatusNoContent)
}
func (a *Api) image(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	image, err := a.manager.Image(id)
	if err != nil {
		log.Errorf("error deleting image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(image); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) imagesByProjectId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectId := vars["project_id"]

	images, err := a.manager.ImagesByProjectId(projectId)
	if err != nil {
		log.Errorf("error getting images for project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := json.NewEncoder(w).Encode(images); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
func (a *Api) addImagesToProjectId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["project_id"]

	project, err := a.manager.Project(id)
	if err != nil {
		log.Errorf("error updating project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.AddImagesToProjectId(project); err != nil {
		log.Errorf("error updating images for project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated project: name=%s", project.Name)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) deleteImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	image, err := a.manager.Image(id)
	if err != nil {
		log.Errorf("error deleting image: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := a.manager.DeleteImage(image); err != nil {
		log.Errorf("error deleting image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted image: id=%s name=%s", image.ID, image.Name)
	w.WriteHeader(http.StatusNoContent)
}
