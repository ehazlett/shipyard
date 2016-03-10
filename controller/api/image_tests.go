package api

//imports here
import (
	"net/http"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
)

func (a *Api) testImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := a.manager.TestImage(id)
	if err != nil {
		log.Errorf("error testing image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}
func (a *Api) testImagesForProjectId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := a.manager.TestImagesForProjectId(id)
	if err != nil {
		log.Errorf("error testing images for project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
