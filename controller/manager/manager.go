package manager

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"crypto/tls"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/sessions"
	"github.com/samalba/dockerclient"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/dockerhub"
	"github.com/shipyard/shipyard/version"
	r "gopkg.in/dancannon/gorethink.v2"
)

const (
	tblNameConfig      = "config"
	tblNameEvents      = "events"
	tblNameAccounts    = "accounts"
	tblNameRoles       = "roles"
	tblNameServiceKeys = "service_keys"
	tblNameExtensions  = "extensions"
	tblNameWebhookKeys = "webhook_keys"
	tblNameRegistries  = "registries"
	tblNameConsole     = "console"
	storeKey           = "shipyard"
	trackerHost        = "http://tracker.shipyard-project.com"
	NodeHealthUp       = "up"
	NodeHealthDown     = "down"
)

var (
	ErrCannotPingRegistry         = errors.New("Cannot ping registry")
	ErrLoginFailure               = errors.New("invalid username or password")
	ErrAccountExists              = errors.New("account already exists")
	ErrAccountDoesNotExist        = errors.New("account does not exist")
	ErrRoleDoesNotExist           = errors.New("role does not exist")
	ErrNodeDoesNotExist           = errors.New("node does not exist")
	ErrServiceKeyDoesNotExist     = errors.New("service key does not exist")
	ErrInvalidAuthToken           = errors.New("invalid auth token")
	ErrExtensionDoesNotExist      = errors.New("extension does not exist")
	ErrWebhookKeyDoesNotExist     = errors.New("webhook key does not exist")
	ErrRegistryDoesNotExist       = errors.New("registry does not exist")
	ErrConsoleSessionDoesNotExist = errors.New("console session does not exist")
	store                         = sessions.NewCookieStore([]byte(storeKey))
)

type (
	DefaultManager struct {
		storeKey         string
		database         string
		authKey          string
		session          *r.Session
		authenticator    auth.Authenticator
		store            *sessions.CookieStore
		client           *dockerclient.DockerClient
		disableUsageInfo bool
	}

	ScaleResult struct {
		Scaled []string
		Errors []string
	}

	Manager interface {
		Accounts() ([]*auth.Account, error)
		Account(username string) (*auth.Account, error)
		Authenticate(username, password string) (bool, error)
		GetAuthenticator() auth.Authenticator
		SaveAccount(account *auth.Account) error
		DeleteAccount(account *auth.Account) error
		Roles() ([]*auth.ACL, error)
		Role(name string) (*auth.ACL, error)
		Store() *sessions.CookieStore
		StoreKey() string
		Container(id string) (*dockerclient.ContainerInfo, error)
		ScaleContainer(id string, numInstances int) ScaleResult
		SaveServiceKey(key *auth.ServiceKey) error
		RemoveServiceKey(key string) error
		SaveEvent(event *shipyard.Event) error
		Events(limit int) ([]*shipyard.Event, error)
		PurgeEvents() error
		ServiceKey(key string) (*auth.ServiceKey, error)
		ServiceKeys() ([]*auth.ServiceKey, error)
		NewAuthToken(username string, userAgent string) (*auth.AuthToken, error)
		VerifyAuthToken(username, token string) error
		VerifyServiceKey(key string) error
		NewServiceKey(description string) (*auth.ServiceKey, error)
		ChangePassword(username, password string) error
		WebhookKey(key string) (*dockerhub.WebhookKey, error)
		WebhookKeys() ([]*dockerhub.WebhookKey, error)
		NewWebhookKey(image string) (*dockerhub.WebhookKey, error)
		SaveWebhookKey(key *dockerhub.WebhookKey) error
		DeleteWebhookKey(id string) error
		DockerClient() *dockerclient.DockerClient

		Nodes() ([]*shipyard.Node, error)
		Node(name string) (*shipyard.Node, error)

		AddRegistry(registry *shipyard.Registry) error
		RemoveRegistry(registry *shipyard.Registry) error
		Registries() ([]*shipyard.Registry, error)
		Registry(name string) (*shipyard.Registry, error)
		RegistryByAddress(addr string) (*shipyard.Registry, error)

		CreateConsoleSession(c *shipyard.ConsoleSession) error
		RemoveConsoleSession(c *shipyard.ConsoleSession) error
		ConsoleSession(token string) (*shipyard.ConsoleSession, error)
		ValidateConsoleSessionToken(containerId, token string) bool
	}
)

func NewManager(addr string, database string, authKey string, client *dockerclient.DockerClient, disableUsageInfo bool, authenticator auth.Authenticator) (Manager, error) {
	log.Debug("setting up rethinkdb session")
	session, err := r.Connect(r.ConnectOpts{
		Address:  addr,
		Database: database,
		AuthKey:  authKey,
	})
	if err != nil {
		return nil, err
	}
	log.Info("checking database")

	r.DBCreate(database).Run(session)
	m := &DefaultManager{
		database:         database,
		authKey:          authKey,
		session:          session,
		authenticator:    authenticator,
		store:            store,
		client:           client,
		storeKey:         storeKey,
		disableUsageInfo: disableUsageInfo,
	}
	m.initdb()
	m.init()
	return m, nil
}

func (m DefaultManager) Store() *sessions.CookieStore {
	return m.store
}

func (m DefaultManager) DockerClient() *dockerclient.DockerClient {
	return m.client
}

func (m DefaultManager) StoreKey() string {
	return m.storeKey
}

func (m DefaultManager) initdb() {
	// create tables if needed
	tables := []string{tblNameConfig, tblNameEvents, tblNameAccounts, tblNameRoles, tblNameConsole, tblNameServiceKeys, tblNameRegistries, tblNameExtensions, tblNameWebhookKeys}
	for _, tbl := range tables {
		_, err := r.Table(tbl).Run(m.session)
		if err != nil {
			if _, err := r.DB(m.database).TableCreate(tbl).Run(m.session); err != nil {
				log.Fatalf("error creating table: %s", err)
			}
		}
	}
}

func (m DefaultManager) init() error {
	// anonymous usage info
	go m.usageReport()
	return nil
}

func (m DefaultManager) logEvent(eventType, message string, tags []string) {
	evt := &shipyard.Event{
		Type:    eventType,
		Time:    time.Now(),
		Message: message,
		Tags:    tags,
	}

	if err := m.SaveEvent(evt); err != nil {
		log.Errorf("error logging event: %s", err)
	}
}

func (m DefaultManager) usageReport() {
	if m.disableUsageInfo {
		return
	}
	m.uploadUsage()
	t := time.NewTicker(1 * time.Hour).C
	for {
		select {
		case <-t:
			go m.uploadUsage()
		}
	}
}

func (m DefaultManager) uploadUsage() {
	id := "anon"
	ifaces, err := net.Interfaces()
	if err == nil {
		for _, iface := range ifaces {
			if iface.Name != "lo" {
				hw := iface.HardwareAddr.String()
				id = strings.Replace(hw, ":", "", -1)
				break
			}
		}
	}
	usage := &shipyard.Usage{
		ID:      id,
		Version: version.Version,
	}
	b, err := json.Marshal(usage)
	if err != nil {
		log.Warnf("error serializing usage info: %s", err)
	}
	buf := bytes.NewBuffer(b)
	if _, err := http.Post(fmt.Sprintf("%s/update", trackerHost), "application/json", buf); err != nil {
		log.Warnf("error sending usage info: %s", err)
	}
}

func (m DefaultManager) Container(id string) (*dockerclient.ContainerInfo, error) {
	return m.client.InspectContainer(id)
}

func (m DefaultManager) ScaleContainer(id string, numInstances int) ScaleResult {
	var (
		errChan = make(chan (error))
		resChan = make(chan (string))
		result  = ScaleResult{Scaled: make([]string, 0), Errors: make([]string, 0)}
		lock    sync.Mutex // when set container affinities to swarm cluster, must use mutex
	)

	containerInfo, err := m.Container(id)
	if err != nil {
		result.Errors = append(result.Errors, err.Error())
		return result
	}

	for i := 0; i < numInstances; i++ {
		go func(instance int) {
			log.Debugf("scaling: id=%s #=%d", containerInfo.Id, instance)
			config := containerInfo.Config
			// clear hostname to get a newly generated
			config.Hostname = ""
			hostConfig := containerInfo.HostConfig
			config.HostConfig = *hostConfig // sending hostconfig via the Start-endpoint is deprecated starting with docker-engine 1.12

			lock.Lock()
			defer lock.Unlock()
			id, err := m.client.CreateContainer(config, "", nil)
			if err != nil {
				errChan <- err
				return
			}
			if err := m.client.StartContainer(id, hostConfig); err != nil {
				errChan <- err
				return
			}
			resChan <- id
		}(i)
	}

	for i := 0; i < numInstances; i++ {
		select {
		case id := <-resChan:
			result.Scaled = append(result.Scaled, id)
		case err := <-errChan:
			log.Errorf("error scaling container: err=%s", strings.TrimSpace(err.Error()))
			result.Errors = append(result.Errors, strings.TrimSpace(err.Error()))
		}
	}

	return result
}

func (m DefaultManager) SaveServiceKey(key *auth.ServiceKey) error {
	if _, err := r.Table(tblNameServiceKeys).Insert(key).RunWrite(m.session); err != nil {
		return err
	}

	m.logEvent("add-service-key", fmt.Sprintf("description=%s", key.Description), []string{"security"})

	return nil
}

func (m DefaultManager) RemoveServiceKey(key string) error {
	if _, err := r.Table(tblNameServiceKeys).Filter(map[string]string{"key": key}).Delete().RunWrite(m.session); err != nil {
		return err
	}

	m.logEvent("delete-service-key", fmt.Sprintf("key=%s", key), []string{"security"})

	return nil
}

func (m DefaultManager) SaveEvent(event *shipyard.Event) error {
	if _, err := r.Table(tblNameEvents).Insert(event).RunWrite(m.session); err != nil {
		return err
	}

	return nil
}

func (m DefaultManager) Events(limit int) ([]*shipyard.Event, error) {
	t := r.Table(tblNameEvents).OrderBy(r.Desc("Time"))
	if limit > -1 {
		t.Limit(limit)
	}
	res, err := t.Run(m.session)
	if err != nil {
		return nil, err
	}
	events := []*shipyard.Event{}
	if err := res.All(&events); err != nil {
		return nil, err
	}
	return events, nil
}

func (m DefaultManager) PurgeEvents() error {
	if _, err := r.Table(tblNameEvents).Delete().RunWrite(m.session); err != nil {
		return err
	}
	return nil
}

func (m DefaultManager) ServiceKey(key string) (*auth.ServiceKey, error) {
	res, err := r.Table(tblNameServiceKeys).Filter(map[string]string{"key": key}).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrServiceKeyDoesNotExist
	}
	var k *auth.ServiceKey
	if err := res.One(&k); err != nil {
		return nil, err
	}
	return k, nil
}

func (m DefaultManager) ServiceKeys() ([]*auth.ServiceKey, error) {
	res, err := r.Table(tblNameServiceKeys).Run(m.session)
	if err != nil {
		return nil, err
	}
	keys := []*auth.ServiceKey{}
	if err := res.All(&keys); err != nil {
		return nil, err
	}
	return keys, nil
}

func (m DefaultManager) Accounts() ([]*auth.Account, error) {
	res, err := r.Table(tblNameAccounts).OrderBy(r.Asc("username")).Run(m.session)
	if err != nil {
		return nil, err
	}
	accounts := []*auth.Account{}
	if err := res.All(&accounts); err != nil {
		return nil, err
	}
	return accounts, nil
}

func (m DefaultManager) Account(username string) (*auth.Account, error) {
	res, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": username}).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrAccountDoesNotExist
	}
	var account *auth.Account
	if err := res.One(&account); err != nil {
		return nil, err
	}
	return account, nil
}

func (m DefaultManager) SaveAccount(account *auth.Account) error {
	var (
		hash      string
		eventType string
	)
	if account.Password != "" {
		h, err := auth.Hash(account.Password)
		if err != nil {
			return err
		}

		hash = h
	}
	// check if exists; if so, update
	acct, err := m.Account(account.Username)
	if err != nil && err != ErrAccountDoesNotExist {
		return err
	}

	// update
	if acct != nil {
		updates := map[string]interface{}{
			"first_name": account.FirstName,
			"last_name":  account.LastName,
			"roles":      account.Roles,
		}
		if account.Password != "" {
			updates["password"] = hash
		}

		if _, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": account.Username}).Update(updates).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-account"
	} else {
		account.Password = hash
		if _, err := r.Table(tblNameAccounts).Insert(account).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "add-account"
	}

	m.logEvent(eventType, fmt.Sprintf("username=%s", account.Username), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAccount(account *auth.Account) error {
	res, err := r.Table(tblNameAccounts).Filter(map[string]string{"id": account.ID}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrAccountDoesNotExist
	}

	m.logEvent("delete-account", fmt.Sprintf("username=%s", account.Username), []string{"security"})

	return nil
}

func (m DefaultManager) Roles() ([]*auth.ACL, error) {
	roles := auth.DefaultACLs()
	return roles, nil
}

func (m DefaultManager) Role(name string) (*auth.ACL, error) {
	acls, err := m.Roles()
	if err != nil {
		return nil, err
	}

	for _, r := range acls {
		if r.RoleName == name {
			return r, nil
		}
	}

	return nil, nil
}

func (m DefaultManager) GetAuthenticator() auth.Authenticator {
	return m.authenticator
}

func (m DefaultManager) Authenticate(username, password string) (bool, error) {
	// only get the account to get the hashed password if using the builtin auth
	passwordHash := ""
	if m.authenticator.Name() == "builtin" {
		acct, err := m.Account(username)
		if err != nil {
			log.Error(err)
			return false, ErrLoginFailure
		}

		passwordHash = acct.Password
	}

	a, err := m.authenticator.Authenticate(username, password, passwordHash)
	if !a || err != nil {
		log.Error(ErrLoginFailure)
		return false, ErrLoginFailure
	}

	return true, nil
}

func (m DefaultManager) NewAuthToken(username string, userAgent string) (*auth.AuthToken, error) {
	tk, err := m.authenticator.GenerateToken()
	if err != nil {
		return nil, err
	}
	acct, err := m.Account(username)
	if err != nil {
		return nil, err
	}
	token := &auth.AuthToken{}
	tokens := acct.Tokens
	found := false
	for _, t := range tokens {
		if t.UserAgent == userAgent {
			found = true
			t.Token = tk
			token = t
			break
		}
	}
	if !found {
		token = &auth.AuthToken{
			UserAgent: userAgent,
			Token:     tk,
		}
		tokens = append(tokens, token)
	}
	// delete token
	if _, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": username}).Filter(r.Row.Field("user_agent").Eq(userAgent)).Delete().Run(m.session); err != nil {
		return nil, err
	}
	// add
	if _, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": username}).Update(map[string]interface{}{"tokens": tokens}).RunWrite(m.session); err != nil {
		return nil, err
	}
	return token, nil
}

func (m DefaultManager) VerifyAuthToken(username, token string) error {
	acct, err := m.Account(username)
	if err != nil {
		return err
	}
	found := false
	for _, t := range acct.Tokens {
		if token == t.Token {
			found = true
			break
		}
	}
	if !found {
		return ErrInvalidAuthToken
	}
	return nil
}

func (m DefaultManager) VerifyServiceKey(key string) error {
	if _, err := m.ServiceKey(key); err != nil {
		return err
	}
	return nil
}

func (m DefaultManager) NewServiceKey(description string) (*auth.ServiceKey, error) {
	k, err := m.authenticator.GenerateToken()
	if err != nil {
		return nil, err
	}
	key := &auth.ServiceKey{
		Key:         k[24:],
		Description: description,
	}
	if err := m.SaveServiceKey(key); err != nil {
		return nil, err
	}
	return key, nil
}

func (m DefaultManager) ChangePassword(username, password string) error {
	if !m.authenticator.IsUpdateSupported() {
		return fmt.Errorf("not supported for authenticator: %s", m.authenticator.Name())
	}

	hash, err := auth.Hash(password)
	if err != nil {
		return err
	}

	if _, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": username}).Update(map[string]string{"password": hash}).Run(m.session); err != nil {
		return err
	}

	m.logEvent("change-password", username, []string{"security"})

	return nil
}

func (m DefaultManager) WebhookKey(key string) (*dockerhub.WebhookKey, error) {
	res, err := r.Table(tblNameWebhookKeys).Filter(map[string]string{"key": key}).Run(m.session)
	if err != nil {
		return nil, err

	}

	if res.IsNil() {
		return nil, ErrWebhookKeyDoesNotExist

	}

	var k *dockerhub.WebhookKey
	if err := res.One(&k); err != nil {
		return nil, err

	}

	return k, nil
}

func (m DefaultManager) WebhookKeys() ([]*dockerhub.WebhookKey, error) {
	res, err := r.Table(tblNameWebhookKeys).OrderBy(r.Asc("image")).Run(m.session)
	if err != nil {
		return nil, err
	}
	keys := []*dockerhub.WebhookKey{}
	if err := res.All(&keys); err != nil {
		return nil, err
	}
	return keys, nil
}

func (m DefaultManager) NewWebhookKey(image string) (*dockerhub.WebhookKey, error) {
	k := generateId(16)
	key := &dockerhub.WebhookKey{
		Key:   k,
		Image: image,
	}

	if err := m.SaveWebhookKey(key); err != nil {
		return nil, err
	}

	return key, nil
}

func (m DefaultManager) SaveWebhookKey(key *dockerhub.WebhookKey) error {
	if _, err := r.Table(tblNameWebhookKeys).Insert(key).RunWrite(m.session); err != nil {
		return err

	}

	m.logEvent("add-webhook-key", fmt.Sprintf("image=%s", key.Image), []string{"webhook"})

	return nil
}

func (m DefaultManager) DeleteWebhookKey(id string) error {
	key, err := m.WebhookKey(id)
	if err != nil {
		return err

	}
	res, err := r.Table(tblNameWebhookKeys).Get(key.ID).Delete().Run(m.session)
	if err != nil {
		return err

	}

	if res.IsNil() {
		return ErrWebhookKeyDoesNotExist

	}

	m.logEvent("delete-webhook-key", fmt.Sprintf("image=%s", key.Image), []string{"webhook"})

	return nil
}

func (m DefaultManager) Nodes() ([]*shipyard.Node, error) {
	info, err := m.client.Info()
	if err != nil {
		return nil, err
	}

	nodes, err := parseClusterNodes(info.DriverStatus)
	if err != nil {
		return nil, err
	}

	return nodes, nil
}

func (m DefaultManager) Node(name string) (*shipyard.Node, error) {
	nodes, err := m.Nodes()
	if err != nil {
		return nil, err
	}

	for _, node := range nodes {
		if node.Name == name {
			return node, nil
		}
	}

	return nil, nil
}

func (m DefaultManager) PingRegistry(registry *shipyard.Registry) error {

	// TODO: Please note the trailing forward slash / which is needed for Artifactory, else you get a 404.
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/v2/", registry.Addr), nil)

	if err != nil {
		return err
	}

	req.SetBasicAuth(registry.Username, registry.Password)

	var tlsConfig *tls.Config

	tlsConfig = nil

	if registry.TlsSkipVerify {
		tlsConfig = &tls.Config{InsecureSkipVerify: true}
	}

	// Create unsecured client
	trans := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	client := &http.Client{Transport: trans}

	resp, err := client.Do(req)

	if err != nil {
		return err
	}
	if resp.StatusCode != 200 {
		return errors.New(resp.Status)
	}

	return nil
}

func (m DefaultManager) AddRegistry(registry *shipyard.Registry) error {

	if err := registry.InitRegistryClient(); err != nil {
		return err
	}

	// TODO: consider not doing a test on adding the record, perhaps have a pingRegistry route that does this through API.
	if err := m.PingRegistry(registry); err != nil {
		log.Error(err)
		return ErrCannotPingRegistry
	}

	if _, err := r.Table(tblNameRegistries).Insert(registry).RunWrite(m.session); err != nil {
		return err
	}
	m.logEvent("add-registry", fmt.Sprintf("name=%s endpoint=%s", registry.Name, registry.Addr), []string{"registry"})

	return nil
}

func (m DefaultManager) RemoveRegistry(registry *shipyard.Registry) error {
	res, err := r.Table(tblNameRegistries).Get(registry.ID).Delete().Run(m.session)
	defer res.Close()
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrRegistryDoesNotExist
	}

	m.logEvent("delete-registry", fmt.Sprintf("name=%s endpoint=%s", registry.Name, registry.Addr), []string{"registry"})

	return nil
}

func (m DefaultManager) Registries() ([]*shipyard.Registry, error) {
	res, err := r.Table(tblNameRegistries).OrderBy(r.Asc("name")).Run(m.session)
	defer res.Close()
	if err != nil {
		return nil, err
	}

	regs := []*shipyard.Registry{}
	if err := res.All(&regs); err != nil {
		return nil, err
	}

	for _, registry := range regs {
		if err := registry.InitRegistryClient(); err != nil {
			log.Errorf("%s", err.Error())
		}
	}

	return regs, nil
}

func (m DefaultManager) Registry(id string) (*shipyard.Registry, error) {
	res, err := r.Table(tblNameRegistries).Filter(map[string]string{"id": id}).Run(m.session)
	defer res.Close()
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrRegistryDoesNotExist
	}
	var reg *shipyard.Registry
	if err := res.One(&reg); err != nil {
		return nil, err
	}

	if err := reg.InitRegistryClient(); err != nil {
		log.Errorf("%s", err.Error())
		return reg, err
	}

	return reg, nil
}

func (m DefaultManager) RegistryByAddress(addr string) (*shipyard.Registry, error) {
	res, err := r.Table(tblNameRegistries).Filter(map[string]string{"addr": addr}).Run(m.session)
	defer res.Close()
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		log.Debugf("Could not find registry with address %s", addr)
		return nil, ErrRegistryDoesNotExist
	}
	var reg *shipyard.Registry
	if err := res.One(&reg); err != nil {
		return nil, err
	}

	if err := reg.InitRegistryClient(); err != nil {
		log.Error(err)
		return reg, err
	}

	return reg, nil
}

func (m DefaultManager) CreateConsoleSession(c *shipyard.ConsoleSession) error {
	if _, err := r.Table(tblNameConsole).Insert(c).RunWrite(m.session); err != nil {
		return err
	}

	m.logEvent("create-console-session", fmt.Sprintf("container=%s", c.ContainerID), []string{"console"})

	return nil
}

func (m DefaultManager) RemoveConsoleSession(c *shipyard.ConsoleSession) error {
	res, err := r.Table(tblNameConsole).Get(c.ID).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrConsoleSessionDoesNotExist
	}

	return nil
}

func (m DefaultManager) ConsoleSession(token string) (*shipyard.ConsoleSession, error) {
	res, err := r.Table(tblNameConsole).Filter(map[string]string{"token": token}).Run(m.session)
	if err != nil {
		return nil, err
	}

	if res.IsNil() {
		return nil, ErrConsoleSessionDoesNotExist
	}

	var c *shipyard.ConsoleSession
	if err := res.One(&c); err != nil {
		return nil, err
	}

	return c, nil
}

func (m DefaultManager) ValidateConsoleSessionToken(containerId string, token string) bool {
	cs, err := m.ConsoleSession(token)
	if err != nil {
		log.Errorf("error validating console session token: %s", err)
		return false
	}

	if cs == nil || cs.ContainerID != containerId {
		log.Warnf("unauthorized token request: %s", token)
		return false
	}

	if err := m.RemoveConsoleSession(cs); err != nil {
		log.Error(err)
		return false
	}

	return true
}
