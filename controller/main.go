package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/citadel/citadel"
	"github.com/codegangsta/negroni"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/controller/manager"
	"github.com/shipyard/shipyard/controller/middleware/access"
	"github.com/shipyard/shipyard/controller/middleware/auth"
	"github.com/shipyard/shipyard/dockerhub"
	"github.com/sirupsen/logrus"
)

var (
	listenAddr        string
	rethinkdbAddr     string
	rethinkdbDatabase string
	rethinkdbAuthKey  string
	disableUsageInfo  bool
	showVersion       bool
	controllerManager *manager.Manager
	logger            = logrus.New()
)

const (
	STORE_KEY = "shipyard"
	VERSION   = "2.0.3"
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
	flag.StringVar(&rethinkdbAuthKey, "rethinkdb-auth-key", "", "rethinkdb auth key")
	flag.BoolVar(&disableUsageInfo, "disable-usage-info", false, "disable anonymous usage info")
	flag.BoolVar(&showVersion, "version", false, "show version and exit")
}

func destroy(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	container, err := controllerManager.Container(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.Destroy(container); err != nil {
		logger.Errorf("error destroying %s: %s", container.ID, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("destroyed container %s (%s)", container.ID, container.Image.Name)

	w.WriteHeader(http.StatusNoContent)
}

func run(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	p := r.FormValue("pull")
	c := r.FormValue("count")
	count := 1
	pull := false
	if p != "" {
		pv, err := strconv.ParseBool(p)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		pull = pv
	}
	if c != "" {
		cc, err := strconv.Atoi(c)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		count = cc
	}
	var image *citadel.Image
	if err := json.NewDecoder(r.Body).Decode(&image); err != nil {
		logger.Warnf("error decoding image: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	launched, err := controllerManager.Run(image, count, pull)
	if err != nil {
		logger.Warnf("error running container: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("content-type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(launched); err != nil {
		logger.Error(err)
	}
}

func stopContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	container, err := controllerManager.Container(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.ClusterManager().Stop(container); err != nil {
		logger.Errorf("error stopping %s: %s", container.ID, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("stopped container %s (%s)", container.ID, container.Image.Name)

	w.WriteHeader(http.StatusNoContent)
}

func containerLogs(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	container, err := controllerManager.Container(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data, err := controllerManager.ClusterManager().Logs(container, true, true)
	if err != nil {
		logger.Errorf("error getting logs for %s: %s", container.ID, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	stdcopy.StdCopy(w, w, data)
}

func restartContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	container, err := controllerManager.Container(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.ClusterManager().Restart(container, 10); err != nil {
		logger.Errorf("error restarting %s: %s", container.ID, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("restarted container %s (%s)", container.ID, container.Image.Name)

	w.WriteHeader(http.StatusNoContent)
}

func scaleContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	r.ParseForm()
	sCount := r.FormValue("count")
	if sCount == "" {
		http.Error(w, "you must specify a count", http.StatusBadRequest)
		return
	}
	count, err := strconv.Atoi(sCount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	container, err := controllerManager.Container(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.Scale(container, count); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("scaled container %s (%s) to %d", container.ID, container.Image.Name, count)

	w.WriteHeader(http.StatusNoContent)
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

	containers, err := controllerManager.ClusterManager().ListContainers(true)
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
	vars := mux.Vars(r)
	id := vars["id"]
	engine := controllerManager.Engine(id)
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

func addServiceKey(w http.ResponseWriter, r *http.Request) {
	var k *shipyard.ServiceKey
	if err := json.NewDecoder(r.Body).Decode(&k); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	key, err := controllerManager.NewServiceKey(k.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("created service key key=%s description=%s", key.Key, key.Description)
	if err := json.NewEncoder(w).Encode(key); err != nil {
		logger.Error(err)
	}
}

func serviceKeys(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	keys, err := controllerManager.ServiceKeys()
	if err != nil {
		logger.Error(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := json.NewEncoder(w).Encode(keys); err != nil {
		logger.Error(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func removeServiceKey(w http.ResponseWriter, r *http.Request) {
	var key *shipyard.ServiceKey
	if err := json.NewDecoder(r.Body).Decode(&key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := controllerManager.RemoveServiceKey(key.Key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("removed service key %s", key.Key)
	w.WriteHeader(http.StatusNoContent)
}

func events(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	limit := -1
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

func purgeEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	if err := controllerManager.PurgeEvents(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Info("cluster events purged")
	w.WriteHeader(http.StatusNoContent)
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
	var acct *shipyard.Account
	if err := json.NewDecoder(r.Body).Decode(&acct); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	account, err := controllerManager.Account(acct.Username)
	if err != nil {
		logger.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := controllerManager.DeleteAccount(account); err != nil {
		logger.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("deleted account %s (%s)", account.Username, account.ID)
	w.WriteHeader(http.StatusNoContent)
}

func roles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	roles, err := controllerManager.Roles()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(roles); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func role(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	name := vars["name"]
	role, err := controllerManager.Role(name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func addRole(w http.ResponseWriter, r *http.Request) {
	var role *shipyard.Role
	if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.SaveRole(role); err != nil {
		logger.Errorf("error saving role: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("saved role %s", role.Name)
	w.WriteHeader(http.StatusNoContent)
}

func deleteRole(w http.ResponseWriter, r *http.Request) {
	var role *shipyard.Role
	if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := controllerManager.DeleteRole(role); err != nil {
		logger.Errorf("error deleting role: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func extensions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	exts, err := controllerManager.Extensions()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(exts); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func extension(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	ext, err := controllerManager.Extension(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(ext); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func addExtension(w http.ResponseWriter, r *http.Request) {
	var ext *shipyard.Extension
	if err := json.NewDecoder(r.Body).Decode(&ext); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.SaveExtension(ext); err != nil {
		logger.Errorf("error saving extension: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.Infof("saved extension name=%s version=%s author=%s", ext.Name, ext.Version, ext.Author)
	w.WriteHeader(http.StatusNoContent)
}

func deleteExtension(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if err := controllerManager.DeleteExtension(id); err != nil {
		logger.Errorf("error deleting extension: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("removed extension %s", id)
	w.WriteHeader(http.StatusNoContent)
}

func webhookKeys(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	keys, err := controllerManager.WebhookKeys()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(keys); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func webhookKey(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]
	key, err := controllerManager.WebhookKey(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func addWebhookKey(w http.ResponseWriter, r *http.Request) {
	var k *dockerhub.WebhookKey
	if err := json.NewDecoder(r.Body).Decode(&k); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	key, err := controllerManager.NewWebhookKey(k.Image)
	if err != nil {
		logger.Errorf("error generating webhook key: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("saved webhook key image=%s", key.Image)
	if err := json.NewEncoder(w).Encode(key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func deleteWebhookKey(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if err := controllerManager.DeleteWebhookKey(id); err != nil {
		logger.Errorf("error deleting webhook key: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	logger.Infof("removed webhook key id=%s", id)
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
	token, err := controllerManager.NewAuthToken(creds.Username, r.UserAgent())
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

func hubWebhook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	key, err := controllerManager.WebhookKey(id)
	if err != nil {
		logger.Errorf("invalid webook key: id=%s from %s", id, r.RemoteAddr)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	var webhook *dockerhub.Webhook
	if err := json.NewDecoder(r.Body).Decode(&webhook); err != nil {
		logger.Errorf("error parsing webhook: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if strings.Index(webhook.Repository.RepoName, key.Image) == -1 {
		logger.Errorf("webhook key image does not match: repo=%s image=%s", webhook.Repository.RepoName, key.Image)
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	logger.Infof("received webhook notification for %s", webhook.Repository.RepoName)
	if err := controllerManager.RedeployContainers(webhook.Repository.RepoName); err != nil {
		logger.Errorf("error redeploying containers: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func main() {
	rHost := os.Getenv("RETHINKDB_PORT_28015_TCP_ADDR")
	rPort := os.Getenv("RETHINKDB_PORT_28015_TCP_PORT")
	rDb := os.Getenv("RETHINKDB_DATABASE")
	rAuthKey := os.Getenv("RETHINKDB_AUTH_KEY")
	if rHost != "" && rPort != "" {
		rethinkdbAddr = fmt.Sprintf("%s:%s", rHost, rPort)
	}
	if rDb != "" {
		rethinkdbDatabase = rDb
	}
	if rAuthKey != "" {
		rethinkdbAuthKey = rAuthKey
	}
	flag.Parse()
	if showVersion {
		fmt.Println(VERSION)
		os.Exit(0)
	}
	var (
		mErr      error
		globalMux = http.NewServeMux()
	)

	logger.Infof("shipyard version %s", VERSION)

	controllerManager, mErr = manager.NewManager(rethinkdbAddr, rethinkdbDatabase, rethinkdbAuthKey, VERSION, disableUsageInfo)
	if mErr != nil {
		logger.Fatal(mErr)
	}

	apiRouter := mux.NewRouter()
	apiRouter.HandleFunc("/api/accounts", accounts).Methods("GET")
	apiRouter.HandleFunc("/api/accounts", addAccount).Methods("POST")
	apiRouter.HandleFunc("/api/accounts", deleteAccount).Methods("DELETE")
	apiRouter.HandleFunc("/api/roles", roles).Methods("GET")
	apiRouter.HandleFunc("/api/roles/{name}", role).Methods("GET")
	apiRouter.HandleFunc("/api/roles", addRole).Methods("POST")
	apiRouter.HandleFunc("/api/roles", deleteRole).Methods("DELETE")
	apiRouter.HandleFunc("/api/cluster/info", clusterInfo).Methods("GET")
	apiRouter.HandleFunc("/api/containers", containers).Methods("GET")
	apiRouter.HandleFunc("/api/containers", run).Methods("POST")
	apiRouter.HandleFunc("/api/containers/{id}", inspectContainer).Methods("GET")
	apiRouter.HandleFunc("/api/containers/{id}", destroy).Methods("DELETE")
	apiRouter.HandleFunc("/api/containers/{id}/stop", stopContainer).Methods("GET")
	apiRouter.HandleFunc("/api/containers/{id}/restart", restartContainer).Methods("GET")
	apiRouter.HandleFunc("/api/containers/{id}/scale", scaleContainer).Methods("GET")
	apiRouter.HandleFunc("/api/containers/{id}/logs", containerLogs).Methods("GET")
	apiRouter.HandleFunc("/api/events", events).Methods("GET")
	apiRouter.HandleFunc("/api/events", purgeEvents).Methods("DELETE")
	apiRouter.HandleFunc("/api/engines", engines).Methods("GET")
	apiRouter.HandleFunc("/api/engines", addEngine).Methods("POST")
	apiRouter.HandleFunc("/api/engines/{id}", inspectEngine).Methods("GET")
	apiRouter.HandleFunc("/api/engines/{id}", removeEngine).Methods("DELETE")
	apiRouter.HandleFunc("/api/extensions", extensions).Methods("GET")
	apiRouter.HandleFunc("/api/extensions/{id}", extension).Methods("GET")
	apiRouter.HandleFunc("/api/extensions", addExtension).Methods("POST")
	apiRouter.HandleFunc("/api/extensions/{id}", deleteExtension).Methods("DELETE")
	apiRouter.HandleFunc("/api/servicekeys", serviceKeys).Methods("GET")
	apiRouter.HandleFunc("/api/servicekeys", addServiceKey).Methods("POST")
	apiRouter.HandleFunc("/api/servicekeys", removeServiceKey).Methods("DELETE")
	apiRouter.HandleFunc("/api/webhookkeys", webhookKeys).Methods("GET")
	apiRouter.HandleFunc("/api/webhookkeys/{id}", webhookKey).Methods("GET")
	apiRouter.HandleFunc("/api/webhookkeys", addWebhookKey).Methods("POST")
	apiRouter.HandleFunc("/api/webhookkeys/{id}", deleteWebhookKey).Methods("DELETE")

	// global handler
	globalMux.Handle("/", http.FileServer(http.Dir("static")))

	// api router; protected by auth
	apiAuthRouter := negroni.New()
	apiAuthRequired := auth.NewAuthRequired(controllerManager)
	apiAccessRequired := access.NewAccessRequired(controllerManager)
	apiAuthRouter.Use(negroni.HandlerFunc(apiAuthRequired.HandlerFuncWithNext))
	apiAuthRouter.Use(negroni.HandlerFunc(apiAccessRequired.HandlerFuncWithNext))
	apiAuthRouter.UseHandler(apiRouter)
	globalMux.Handle("/api/", apiAuthRouter)

	// account router ; protected by auth
	accountRouter := mux.NewRouter()
	accountRouter.HandleFunc("/account/changepassword", changePassword).Methods("POST")
	accountAuthRouter := negroni.New()
	accountAuthRequired := auth.NewAuthRequired(controllerManager)
	accountAuthRouter.Use(negroni.HandlerFunc(accountAuthRequired.HandlerFuncWithNext))
	accountAuthRouter.UseHandler(accountRouter)
	globalMux.Handle("/account/", accountAuthRouter)

	// login handler; public
	loginRouter := mux.NewRouter()
	loginRouter.HandleFunc("/auth/login", login).Methods("POST")
	globalMux.Handle("/auth/", loginRouter)

	// hub handler; public
	hubRouter := mux.NewRouter()
	hubRouter.HandleFunc("/hub/webhook/{id}", hubWebhook).Methods("POST")
	globalMux.Handle("/hub/", hubRouter)

	// check for admin user
	if _, err := controllerManager.Account("admin"); err == manager.ErrAccountDoesNotExist {
		// create roles
		r := &shipyard.Role{
			Name: "admin",
		}
		ru := &shipyard.Role{
			Name: "user",
		}
		if err := controllerManager.SaveRole(r); err != nil {
			logger.Fatal(err)
		}
		if err := controllerManager.SaveRole(ru); err != nil {
			logger.Fatal(err)
		}
		role, err := controllerManager.Role(r.Name)
		if err != nil {
			logger.Fatal(err)
		}
		acct := &shipyard.Account{
			Username: "admin",
			Password: "shipyard",
			Role:     role,
		}
		if err := controllerManager.SaveAccount(acct); err != nil {
			logger.Fatal(err)
		}
		logger.Infof("created admin user: username: admin password: shipyard")
	}

	logger.Infof("controller listening on %s", listenAddr)

	if err := http.ListenAndServe(listenAddr, context.ClearHandler(globalMux)); err != nil {
		logger.Fatal(err)
	}
}
