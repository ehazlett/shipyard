package api

//imports here
import (
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"net/http"
)

func (a *Api) testImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	message, err := a.manager.TestImage(id)
	if err != nil {
		log.Errorf("error testing image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write([]byte(message))
}

func (a *Api) testImagesForProjectId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["project_id"]

	message, err := a.manager.TestImagesForProjectId(id)
	if err != nil {
		log.Errorf("error testing images for project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write([]byte(message))
}
