package api

//imports here
import (
	//	"encoding/json"
	"net/http"

	//	log "github.com/Sirupsen/logrus"
	//	"github.com/gorilla/mux"
	//	"github.com/shipyard/shipyard/model"
)

func (a *Api) testImage(w http.ResponseWriter, r *http.Request) {
	err := a.manager.TestImage("test image", "latest")
	err = err
}
