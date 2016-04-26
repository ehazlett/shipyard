package api

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
	"net/http"
)

func (a *Api) createImage(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	projectId := vars["projectId"]
	w.Header().Set("content-type", "application/json")
	var image *model.Image
	if err := json.NewDecoder(r.Body).Decode(&image); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.CreateImage(projectId, image); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Debugf("saved image: id=%s", image.ID)

	// Just return the id for the Project that was created.
	tempResponse := map[string]string{
		"id": image.ID,
	}

	jsonResponse, err := json.Marshal(tempResponse)

	if err != nil {
		// Most probably a 400 BadRequest would be sufficient
		http.Error(w, err.Error(), http.StatusNoContent)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonResponse)
	return

}

func (a *Api) getImages(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("content-type", "application/json")
	vars := mux.Vars(r)
	projId := vars["projectId"]
	images, err := a.manager.GetImages(projId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(images); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) getImage(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	projId := vars["projectId"]
	imageId := vars["imageId"]

	test, err := a.manager.GetImage(projId, imageId)
	if err != nil {
		log.Errorf("error retrieving image: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(test); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) updateImage(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	projId := vars["projectId"]
	imageId := vars["imageId"]

	image, err := a.manager.GetImage(projId, imageId)
	if err != nil {
		log.Errorf("error updating image: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&image); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.UpdateImage(projId, image); err != nil {
		log.Errorf("error updating image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated image: id=%s", image.ID)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) deleteImage(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	projId := vars["projectId"]
	imageId := vars["imageId"]

	image, err := a.manager.GetImage(projId, imageId)
	if err != nil {
		log.Errorf("error deleting image: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := a.manager.DeleteImage(projId, imageId); err != nil {
		log.Errorf("error deleting test: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted image: id=%s", image.ID)
	w.WriteHeader(http.StatusNoContent)
}
