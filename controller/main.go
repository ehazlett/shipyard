package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"strconv"

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
	r.ParseForm()
	p := r.FormValue("pull")
	pull, err := strconv.ParseBool(p)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var image *citadel.Image
	if err := json.NewDecoder(r.Body).Decode(&image); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	container, err := manager.clusterManager.Start(image, pull)
	if err != nil {
		logger.Errorf("error running %s: %s", image.Name, err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	logger.Infof("started %s pull=%v", image.Name, pull)

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

func inspectEngine(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	engine := manager.Engine(id)
	if err := json.NewEncoder(w).Encode(engine); err != nil {
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

func inspectContainer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	container, err := manager.Container(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(container); err != nil {
		logger.Error(err)
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
	logger.Infof("removed engine id=%s", engine.Engine.ID)
	w.WriteHeader(http.StatusNoContent)
}

func clusterInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	info, err := manager.ClusterInfo()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(info); err != nil {
		logger.Error(err)
	}
}

func events(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	limit := 25
	l := r.FormValue("limit")
	if l != "" {
		lt, err := strconv.Atoi(l)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		limit = lt
	}
	events, err := manager.Events(limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(events); err != nil {
		logger.Error(err)
	}
}

func main() {
	flag.Parse()
	var (
		mErr      error
		globalMux = http.NewServeMux()
	)
	manager, mErr = NewManager(rethinkdbAddr, rethinkdbDatabase)
	if mErr != nil {
		logger.Fatal(mErr)
	}

	apiRouter := mux.NewRouter()
	apiRouter.HandleFunc("/api/cluster/info", clusterInfo).Methods("GET")
	apiRouter.HandleFunc("/api/containers", containers).Methods("GET")
	apiRouter.HandleFunc("/api/containers/{id}", inspectContainer).Methods("GET")
	apiRouter.HandleFunc("/api/run", run).Methods("POST")
	apiRouter.HandleFunc("/api/destroy", destroy).Methods("DELETE")
	apiRouter.HandleFunc("/api/engines", engines).Methods("GET")
	apiRouter.HandleFunc("/api/events", events).Methods("GET")
	apiRouter.HandleFunc("/api/engines/{id}", inspectEngine).Methods("GET")
	apiRouter.HandleFunc("/api/engines/add", addEngine).Methods("POST")
	apiRouter.HandleFunc("/api/engines/remove", removeEngine).Methods("POST")
	globalMux.Handle("/api/", apiRouter)

	globalMux.Handle("/", http.FileServer(http.Dir("static")))

	logger.Infof("shipyard controller listening on %s", listenAddr)

	if err := http.ListenAndServe(listenAddr, globalMux); err != nil {
		logger.Fatal(err)
	}
}
