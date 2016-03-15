package api

//imports here
import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"net/http"
)

func (a *Api) testImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	report, err := a.manager.TestImage(id)
	if err != nil {
		log.Errorf("error testing image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	str, err := json.Marshal(report)
	if err != nil {
		log.Errorf("error testing image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}

	w.Write([]byte(string(str)))
}

func (a *Api) testImagesForProjectId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["project_id"]

	reports, err := a.manager.TestImagesForProjectId(id)
	if err != nil {
		log.Errorf("error testing images for project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	str, err := json.Marshal(reports)
	if err != nil {
		log.Errorf("error testing images for project: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return

	}

	w.Write([]byte(string(str)))

}
