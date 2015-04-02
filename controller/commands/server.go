package commands

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	log "github.com/Sirupsen/logrus"
	"github.com/codegangsta/cli"
	"github.com/codegangsta/negroni"
	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/controller/manager"
	"github.com/shipyard/shipyard/controller/middleware/access"
	mAuth "github.com/shipyard/shipyard/controller/middleware/auth"
	"github.com/shipyard/shipyard/dockerhub"
	"github.com/shipyard/shipyard/utils"
)

var (
	listenAddr        string
	rethinkdbAddr     string
	rethinkdbDatabase string
	rethinkdbAuthKey  string
	disableUsageInfo  bool
	showVersion       bool
	controllerManager *manager.Manager
)

type (
	Credentials struct {
		Username string `json:"username,omitempty"`
		Password string `json:"password,omitempty"`
	}
)

func addServiceKey(w http.ResponseWriter, r *http.Request) {
	var k *auth.ServiceKey
	if err := json.NewDecoder(r.Body).Decode(&k); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	key, err := controllerManager.NewServiceKey(k.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("created service key key=%s description=%s", key.Key, key.Description)
	if err := json.NewEncoder(w).Encode(key); err != nil {
		log.Error(err)
	}
}

func serviceKeys(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")

	keys, err := controllerManager.ServiceKeys()
	if err != nil {
		log.Error(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := json.NewEncoder(w).Encode(keys); err != nil {
		log.Error(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
}

func removeServiceKey(w http.ResponseWriter, r *http.Request) {
	var key *auth.ServiceKey
	if err := json.NewDecoder(r.Body).Decode(&key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := controllerManager.RemoveServiceKey(key.Key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("removed service key %s", key.Key)
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
	log.Info("cluster events purged")
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
	var account *auth.Account
	if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.SaveAccount(account); err != nil {
		log.Errorf("error saving account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("saved account %s", account.Username)
	w.WriteHeader(http.StatusNoContent)
}

func deleteAccount(w http.ResponseWriter, r *http.Request) {
	var acct *auth.Account
	if err := json.NewDecoder(r.Body).Decode(&acct); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	account, err := controllerManager.Account(acct.Username)
	if err != nil {
		log.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := controllerManager.DeleteAccount(account); err != nil {
		log.Errorf("error deleting account: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted account %s (%s)", account.Username, account.ID)
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
	var role *auth.Role
	if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := controllerManager.SaveRole(role); err != nil {
		log.Errorf("error saving role: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("saved role %s", role.Name)
	w.WriteHeader(http.StatusNoContent)
}

func deleteRole(w http.ResponseWriter, r *http.Request) {
	var role *auth.Role
	if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := controllerManager.DeleteRole(role); err != nil {
		log.Errorf("error deleting role: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
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
		log.Errorf("error generating webhook key: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("saved webhook key image=%s", key.Image)
	if err := json.NewEncoder(w).Encode(key); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func deleteWebhookKey(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if err := controllerManager.DeleteWebhookKey(id); err != nil {
		log.Errorf("error deleting webhook key: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	log.Infof("removed webhook key id=%s", id)
	w.WriteHeader(http.StatusNoContent)
}

func login(w http.ResponseWriter, r *http.Request) {
	var creds *Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if !controllerManager.Authenticate(creds.Username, creds.Password) {
		log.Errorf("invalid login for %s from %s", creds.Username, r.RemoteAddr)
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
	//TODO: redeploy containers
}

func CmdServer(c *cli.Context) {
	rethinkdbAddr := c.String("rethinkdb-addr")
	rethinkdbDatabase := c.String("rethinkdb-database")
	rethinkdbAuthKey := c.String("rethinkdb-auth-key")
	disableUsageInfo := c.Bool("disable-usage-info")
	listenAddr := c.String("listen")

	var (
		mErr      error
		globalMux = http.NewServeMux()
	)

	log.Infof("shipyard version %s", shipyard.Version)

	dockerUrl := c.GlobalString("docker")
	tlsCaCert := c.GlobalString("tls-ca-cert")
	tlsCert := c.GlobalString("tls-cert")
	tlsKey := c.GlobalString("tls-key")
	allowInsecure := c.GlobalBool("allow-insecure")
	client, err := utils.GetClient(dockerUrl, tlsCaCert, tlsCert, tlsKey, allowInsecure)
	if err != nil {
		log.Fatal(err)
	}

	controllerManager, mErr = manager.NewManager(rethinkdbAddr, rethinkdbDatabase, rethinkdbAuthKey, client, disableUsageInfo)
	if mErr != nil {
		log.Fatal(mErr)
	}

	apiRouter := mux.NewRouter()
	apiRouter.HandleFunc("/api/accounts", accounts).Methods("GET")
	apiRouter.HandleFunc("/api/accounts", addAccount).Methods("POST")
	apiRouter.HandleFunc("/api/accounts", deleteAccount).Methods("DELETE")
	apiRouter.HandleFunc("/api/roles", roles).Methods("GET")
	apiRouter.HandleFunc("/api/roles/{name}", role).Methods("GET")
	apiRouter.HandleFunc("/api/roles", addRole).Methods("POST")
	apiRouter.HandleFunc("/api/roles", deleteRole).Methods("DELETE")
	apiRouter.HandleFunc("/api/events", events).Methods("GET")
	apiRouter.HandleFunc("/api/events", purgeEvents).Methods("DELETE")
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
	apiAuthRequired := mAuth.NewAuthRequired(controllerManager)
	apiAccessRequired := access.NewAccessRequired(controllerManager)
	apiAuthRouter.Use(negroni.HandlerFunc(apiAuthRequired.HandlerFuncWithNext))
	apiAuthRouter.Use(negroni.HandlerFunc(apiAccessRequired.HandlerFuncWithNext))
	apiAuthRouter.UseHandler(apiRouter)
	globalMux.Handle("/api/", apiAuthRouter)

	// account router ; protected by auth
	accountRouter := mux.NewRouter()
	accountRouter.HandleFunc("/account/changepassword", changePassword).Methods("POST")
	accountAuthRouter := negroni.New()
	accountAuthRequired := mAuth.NewAuthRequired(controllerManager)
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
		r := &auth.Role{
			Name: "admin",
		}
		ru := &auth.Role{
			Name: "user",
		}
		if err := controllerManager.SaveRole(r); err != nil {
			log.Fatal(err)
		}
		if err := controllerManager.SaveRole(ru); err != nil {
			log.Fatal(err)
		}
		role, err := controllerManager.Role(r.Name)
		if err != nil {
			log.Fatal(err)
		}
		acct := &auth.Account{
			Username: "admin",
			Password: "shipyard",
			Role:     role,
		}
		if err := controllerManager.SaveAccount(acct); err != nil {
			log.Fatal(err)
		}
		log.Infof("created admin user: username: admin password: shipyard")
	}

	log.Infof("controller listening on %s", listenAddr)

	if err := http.ListenAndServe(listenAddr, context.ClearHandler(globalMux)); err != nil {
		log.Fatal(err)
	}
}
