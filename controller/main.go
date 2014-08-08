package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"

	"github.com/citadel/citadel"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard"
	"github.com/sirupsen/logrus"
)

var (
	listenAddr        string
	rethinkdbAddr     string
	rethinkdbDatabase string
	manager           *Manager
	logger            = logrus.New()
)

func init() {
	flag.StringVar(&listenAddr, "listen", ":8080", "listen address")
	flag.StringVar(&rethinkdbAddr, "rethinkdb-addr", "127.0.0.1:28015", "rethinkdb address")
	flag.StringVar(&rethinkdbDatabase, "rethinkdb-database", "shipyard", "rethinkdb database")
	flag.Parse()
}

func destroy(w http.ResponseWriter, r *http.Request) {
	var container *citadel.Container
	if err := json.NewDecoder(r.Body).Decode(&container); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := manager.clusterManager.Kill(container, 9); err != nil {
		logger.Errorf("error destroying %s: %s", container.ID, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := manager.clusterManager.Remove(container); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("destroyed container %s (%s)", container.ID, container.Image.Name)

	w.WriteHeader(http.StatusNoContent)
}

func run(w http.ResponseWriter, r *http.Request) {
	var image *citadel.Image
	if err := json.NewDecoder(r.Body).Decode(&image); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	container, err := manager.clusterManager.Start(image)
	if err != nil {
		logger.Errorf("error running %s: %s", image.Name, err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	logger.Infof("started %s", image.Name)

	w.Header().Set("content-type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(container); err != nil {
		logger.Error(err)
	}
}

func engines(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	engines := manager.Engines()
	if err := json.NewEncoder(w).Encode(engines); err != nil {
		logger.Error(err)
	}
}

func containers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	containers, err := manager.clusterManager.ListContainers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(containers); err != nil {
		log.Println(err)
	}
}

func addEngine(w http.ResponseWriter, r *http.Request) {
	var engine *shipyard.Engine
	if err := json.NewDecoder(r.Body).Decode(&engine); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := manager.AddEngine(engine); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("added engine id=%s addr=%s cpus=%f memory=%f", engine.Engine.ID, engine.Engine.Addr, engine.Engine.Cpus, engine.Engine.Memory)
	w.WriteHeader(http.StatusCreated)
}

func removeEngine(w http.ResponseWriter, r *http.Request) {
	var engine *shipyard.Engine
	if err := json.NewDecoder(r.Body).Decode(&engine); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := manager.RemoveEngine(engine.ID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("removed engine", engine.ID)
	w.WriteHeader(http.StatusNoContent)
}

func main() {
	var mErr error
	manager, mErr = NewManager(rethinkdbAddr, rethinkdbDatabase)
	if mErr != nil {
		logger.Fatal(mErr)
	}

	r := mux.NewRouter()
	r.HandleFunc("/containers", containers).Methods("GET")
	r.HandleFunc("/run", run).Methods("POST")
	r.HandleFunc("/destroy", destroy).Methods("DELETE")
	r.HandleFunc("/engines", engines).Methods("GET")
	r.HandleFunc("/engines/add", addEngine).Methods("POST")
	r.HandleFunc("/engines/remove", removeEngine).Methods("POST")

	logger.Infof("shipyard controller listening on %s", listenAddr)

	if err := http.ListenAndServe(listenAddr, r); err != nil {
		logger.Fatal(err)
	}
}
