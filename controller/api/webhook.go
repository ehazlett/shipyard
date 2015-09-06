package api

import (
	"encoding/json"
	"net/http"
	"strings"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/dockerhub"
)

func (a *Api) hubWebhook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	key, err := a.manager.WebhookKey(id)
	if err != nil {
		log.Errorf("invalid webook key: id=%s from %s", id, r.RemoteAddr)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	var webhook *dockerhub.Webhook
	if err := json.NewDecoder(r.Body).Decode(&webhook); err != nil {
		log.Errorf("error parsing webhook: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if strings.Index(webhook.Repository.RepoName, key.Image) == -1 {
		log.Errorf("webhook key image does not match: repo=%s image=%s", webhook.Repository.RepoName, key.Image)
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	log.Infof("received webhook notification for %s", webhook.Repository.RepoName)
	// TODO @ehazlett - redeploy containers
}
