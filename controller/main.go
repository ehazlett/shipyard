package main

import (
	"encoding/json"
	"flag"
	"net/http"
	"os"
	"strconv"

	"github.com/citadel/citadel"
	"github.com/codegangsta/negroni"
	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/controller/manager"
	"github.com/shipyard/shipyard/controller/middleware"
	"github.com/sirupsen/logrus"
)

var (
	listenAddr        string
	rethinkdbAddr     string
	rethinkdbDatabase string
	controllerManager *manager.Manager
	logger            = logrus.New()
)

const (
	STORE_KEY = "shipyard"
)

type (
	Credentials struct {
		Username string `json:"username,omitempty"`
		Password string `json:"password,omitempty"`
	}
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

	if err := controllerManager.ClusterManager().Kill(container, 9); err != nil {
		logger.Errorf("error destroying %s: %s", container.ID, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.ClusterManager().Remove(container); err != nil {
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

	container, err := controllerManager.ClusterManager().Start(image, pull)
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

	engines := controllerManager.Engines()
	if err := json.NewEncoder(w).Encode(engines); err != nil {
		logger.Error(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func inspectEngine(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	engine := controllerManager.Engine(id)
	if err := json.NewEncoder(w).Encode(engine); err != nil {
		logger.Error(err)
	}
}

func containers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	containers, err := controllerManager.ClusterManager().ListContainers()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(containers); err != nil {
		logger.Error(err)
	}
}

func inspectContainer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	container, err := controllerManager.Container(id)
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
	if err := controllerManager.AddEngine(engine); err != nil {
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
	if err := controllerManager.RemoveEngine(engine.ID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("removed engine id=%s", engine.Engine.ID)
	w.WriteHeader(http.StatusNoContent)
}

func clusterInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	info, err := controllerManager.ClusterInfo()
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
	events, err := controllerManager.Events(limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(events); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func accounts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	accounts, err := controllerManager.Accounts()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(accounts); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func addAccount(w http.ResponseWriter, r *http.Request) {
	var account *shipyard.Account
	if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.SaveAccount(account); err != nil {
		logger.Errorf("error saving account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("saved account %s", account.Username)
	w.WriteHeader(http.StatusNoContent)
}

func deleteAccount(w http.ResponseWriter, r *http.Request) {
	var account *shipyard.Account
	if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := controllerManager.DeleteAccount(account); err != nil {
		logger.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("deleted account %s", account.ID)
	w.WriteHeader(http.StatusNoContent)
}

func login(w http.ResponseWriter, r *http.Request) {
	var creds *Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !controllerManager.Authenticate(creds.Username, creds.Password) {
		logger.Errorf("invalid login for %s from %s", creds.Username, r.RemoteAddr)
		http.Error(w, "invalid username/password", http.StatusForbidden)
		return
	}
	// return token
	token, err := controllerManager.NewAuthToken(creds.Username)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(token); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func changePassword(w http.ResponseWriter, r *http.Request) {
	session, _ := controllerManager.Store().Get(r, controllerManager.StoreKey)
	var creds *Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	username := session.Values["username"].(string)
	if username == "" {
		http.Error(w, "unauthorized", http.StatusInternalServerError)
		return
	}
	if err := controllerManager.ChangePassword(username, creds.Password); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func main() {
	rAddr := os.Getenv("RETHINKDB_ADDR")
	rDb := os.Getenv("RETHINKDB_DATABASE")
	if rAddr != "" {
		rethinkdbAddr = rAddr
	}
	if rDb != "" {
		rethinkdbDatabase = rDb
	}
	flag.Parse()
	var (
		mErr      error
		globalMux = http.NewServeMux()
	)
	controllerManager, mErr = manager.NewManager(rethinkdbAddr, rethinkdbDatabase)
	if mErr != nil {
		logger.Fatal(mErr)
	}

	apiRouter := mux.NewRouter()
	apiRouter.HandleFunc("/api/accounts", accounts).Methods("GET")
	apiRouter.HandleFunc("/api/accounts", addAccount).Methods("POST")
	apiRouter.HandleFunc("/api/accounts", deleteAccount).Methods("DELETE")
	apiRouter.HandleFunc("/api/cluster/info", clusterInfo).Methods("GET")
	apiRouter.HandleFunc("/api/containers", containers).Methods("GET")
	apiRouter.HandleFunc("/api/containers/{id}", inspectContainer).Methods("GET")
	apiRouter.HandleFunc("/api/run", run).Methods("POST")
	apiRouter.HandleFunc("/api/destroy", destroy).Methods("DELETE")
	apiRouter.HandleFunc("/api/engines", engines).Methods("GET")
	apiRouter.HandleFunc("/api/events", events).Methods("GET")
	apiRouter.HandleFunc("/api/engines/{id}", inspectEngine).Methods("GET")
	apiRouter.HandleFunc("/api/engines", addEngine).Methods("POST")
	apiRouter.HandleFunc("/api/engines", removeEngine).Methods("DELETE")

	// global handler
	globalMux.Handle("/", http.FileServer(http.Dir("static")))

	// api router; protected by auth
	apiAuthRouter := negroni.New()
	apiAuthRequired := middleware.NewAuthRequired(controllerManager)
	apiAuthRouter.Use(negroni.HandlerFunc(apiAuthRequired.HandlerFuncWithNext))
	apiAuthRouter.UseHandler(apiRouter)
	globalMux.Handle("/api/", apiAuthRouter)

	// account router ; protected by auth
	accountRouter := mux.NewRouter()
	accountRouter.HandleFunc("/account/changepassword", changePassword).Methods("POST")
	accountAuthRouter := negroni.New()
	accountAuthRequired := middleware.NewAuthRequired(controllerManager)
	accountAuthRouter.Use(negroni.HandlerFunc(accountAuthRequired.HandlerFuncWithNext))
	accountAuthRouter.UseHandler(accountRouter)
	globalMux.Handle("/account/", accountAuthRouter)

	// login handler; public
	loginRouter := mux.NewRouter()
	loginRouter.HandleFunc("/auth/login", login).Methods("POST")
	globalMux.Handle("/auth/", loginRouter)

	// check for admin user
	if _, err := controllerManager.Account("admin"); err == manager.ErrAccountDoesNotExist {
		acct := &shipyard.Account{
			Username: "admin",
			Password: "shipyard",
		}
		if err := controllerManager.SaveAccount(acct); err != nil {
			logger.Fatal(err)
		}
		logger.Infof("created admin user: username: admin password: shipyard")
	}

	logger.Infof("shipyard controller listening on %s", listenAddr)

	if err := http.ListenAndServe(listenAddr, context.ClearHandler(globalMux)); err != nil {
		logger.Fatal(err)
	}
}
