package manager

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	log "github.com/Sirupsen/logrus"
	r "github.com/dancannon/gorethink"
	"github.com/gorilla/sessions"
	"github.com/samalba/dockerclient"
	"github.com/shipyard/shipyard"
	"github.com/shipyard/shipyard/auth"
	"github.com/shipyard/shipyard/dockerhub"
)

const (
	tblNameConfig      = "config"
	tblNameEvents      = "events"
	tblNameAccounts    = "accounts"
	tblNameRoles       = "roles"
	tblNameServiceKeys = "service_keys"
	tblNameExtensions  = "extensions"
	tblNameWebhookKeys = "webhook_keys"
	storeKey           = "shipyard"
	trackerHost        = "http://tracker.shipyard-project.com"
	EngineHealthUp     = "up"
	EngineHealthDown   = "down"
)

var (
	ErrAccountExists          = errors.New("account already exists")
	ErrAccountDoesNotExist    = errors.New("account does not exist")
	ErrRoleDoesNotExist       = errors.New("role does not exist")
	ErrServiceKeyDoesNotExist = errors.New("service key does not exist")
	ErrInvalidAuthToken       = errors.New("invalid auth token")
	ErrExtensionDoesNotExist  = errors.New("extension does not exist")
	ErrWebhookKeyDoesNotExist = errors.New("webhook key does not exist")
	store                     = sessions.NewCookieStore([]byte(storeKey))
)

type (
	Manager struct {
		StoreKey         string
		address          string
		database         string
		authKey          string
		session          *r.Session
		authenticator    *auth.Authenticator
		store            *sessions.CookieStore
		client           *dockerclient.DockerClient
		disableUsageInfo bool
	}
)

func NewManager(addr string, database string, authKey string, client *dockerclient.DockerClient, disableUsageInfo bool) (*Manager, error) {
	session, err := r.Connect(r.ConnectOpts{
		Address:     addr,
		Database:    database,
		AuthKey:     authKey,
		MaxIdle:     10,
		IdleTimeout: time.Second * 30,
	})
	if err != nil {
		return nil, err
	}
	log.Info("checking database")
	r.DbCreate(database).Run(session)
	m := &Manager{
		address:          addr,
		database:         database,
		authKey:          authKey,
		session:          session,
		authenticator:    &auth.Authenticator{},
		store:            store,
		client:           client,
		StoreKey:         storeKey,
		disableUsageInfo: disableUsageInfo,
	}
	m.initdb()
	m.init()
	return m, nil
}

func (m *Manager) Store() *sessions.CookieStore {
	return m.store
}

func (m *Manager) initdb() {
	// create tables if needed
	tables := []string{tblNameConfig, tblNameEvents, tblNameAccounts, tblNameRoles, tblNameServiceKeys, tblNameExtensions, tblNameWebhookKeys}
	for _, tbl := range tables {
		_, err := r.Table(tbl).Run(m.session)
		if err != nil {
			if _, err := r.Db(m.database).TableCreate(tbl).Run(m.session); err != nil {
				log.Fatalf("error creating table: %s", err)
			}
		}
	}
}

func (m *Manager) init() error {
	// anonymous usage info
	go m.usageReport()
	return nil
}

func (m *Manager) usageReport() {
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

func (m *Manager) uploadUsage() {
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
		Version: shipyard.Version,
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

func (m *Manager) Container(id string) (*dockerclient.ContainerInfo, error) {
	return m.client.InspectContainer(id)
}

func (m *Manager) SaveServiceKey(key *auth.ServiceKey) error {
	if _, err := r.Table(tblNameServiceKeys).Insert(key).RunWrite(m.session); err != nil {
		return err
	}
	m.init()
	evt := &shipyard.Event{
		Type:    "add-service-key",
		Time:    time.Now(),
		Message: fmt.Sprintf("description=%s", key.Description),
		Tags:    []string{"cluster", "security"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}

func (m *Manager) RemoveServiceKey(key string) error {
	k, err := m.ServiceKey(key)
	if err != nil {
		return err
	}
	evt := &shipyard.Event{
		Type:    "remove-service-key",
		Time:    time.Now(),
		Message: fmt.Sprintf("description=%s", k.Description),
		Tags:    []string{"cluster", "security"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	if _, err := r.Table(tblNameServiceKeys).Filter(map[string]string{"key": key}).Delete().RunWrite(m.session); err != nil {
		return err
	}
	return nil
}

func (m *Manager) SaveEvent(event *shipyard.Event) error {
	if _, err := r.Table(tblNameEvents).Insert(event).RunWrite(m.session); err != nil {
		return err
	}
	return nil
}

func (m *Manager) Events(limit int) ([]*shipyard.Event, error) {
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

func (m *Manager) PurgeEvents() error {
	if _, err := r.Table(tblNameEvents).Delete().RunWrite(m.session); err != nil {
		return err
	}
	return nil
}

func (m *Manager) ServiceKey(key string) (*auth.ServiceKey, error) {
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

func (m *Manager) ServiceKeys() ([]*auth.ServiceKey, error) {
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

func (m *Manager) Accounts() ([]*auth.Account, error) {
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

func (m *Manager) Account(username string) (*auth.Account, error) {
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

func (m *Manager) SaveAccount(account *auth.Account) error {
	pass := account.Password
	hash, err := m.authenticator.Hash(pass)
	if err != nil {
		return err
	}
	// check if exists; if so, update
	acct, err := m.Account(account.Username)
	if err != nil && err != ErrAccountDoesNotExist {
		return err
	}
	account.Password = hash
	if acct != nil {
		if _, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": account.Username}).Update(map[string]string{"password": hash}).RunWrite(m.session); err != nil {
			return err
		}
		return nil
	}
	if _, err := r.Table(tblNameAccounts).Insert(account).RunWrite(m.session); err != nil {
		return err
	}
	evt := &shipyard.Event{
		Type:    "add-account",
		Time:    time.Now(),
		Message: fmt.Sprintf("username=%s", account.Username),
		Tags:    []string{"cluster", "security"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}

func (m *Manager) DeleteAccount(account *auth.Account) error {
	res, err := r.Table(tblNameAccounts).Filter(map[string]string{"id": account.ID}).Delete().Run(m.session)
	if err != nil {
		return err
	}
	if res.IsNil() {
		return ErrAccountDoesNotExist
	}
	evt := &shipyard.Event{
		Type:    "delete-account",
		Time:    time.Now(),
		Message: fmt.Sprintf("username=%s", account.Username),
		Tags:    []string{"cluster", "security"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}

func (m *Manager) Roles() ([]*auth.Role, error) {
	res, err := r.Table(tblNameRoles).OrderBy(r.Asc("name")).Run(m.session)
	if err != nil {
		return nil, err
	}
	roles := []*auth.Role{}
	if err := res.All(&roles); err != nil {
		return nil, err
	}
	return roles, nil
}

func (m *Manager) Role(name string) (*auth.Role, error) {
	res, err := r.Table(tblNameRoles).Filter(map[string]string{"name": name}).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrRoleDoesNotExist
	}
	var role *auth.Role
	if err := res.One(&role); err != nil {
		return nil, err
	}
	return role, nil
}

func (m *Manager) SaveRole(role *auth.Role) error {
	if _, err := r.Table(tblNameRoles).Insert(role).RunWrite(m.session); err != nil {
		return err
	}

	evt := &shipyard.Event{
		Type:    "add-role",
		Time:    time.Now(),
		Message: fmt.Sprintf("name=%s", role.Name),
		Tags:    []string{"cluster", "security"},
	}

	if err := m.SaveEvent(evt); err != nil {
		return err
	}

	return nil
}

func (m *Manager) DeleteRole(role *auth.Role) error {
	res, err := r.Table(tblNameRoles).Get(role.ID).Delete().Run(m.session)
	if err != nil {
		return err
	}
	if res.IsNil() {
		return ErrRoleDoesNotExist
	}
	evt := &shipyard.Event{
		Type:    "delete-role",
		Time:    time.Now(),
		Message: fmt.Sprintf("name=%s", role.Name),
		Tags:    []string{"cluster", "security"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}

func (m *Manager) Authenticate(username, password string) bool {
	acct, err := m.Account(username)
	if err != nil {
		log.Error(err)
		return false
	}
	return m.authenticator.Authenticate(password, acct.Password)
}

func (m *Manager) NewAuthToken(username string, userAgent string) (*auth.AuthToken, error) {
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

func (m *Manager) VerifyAuthToken(username, token string) error {
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

func (m *Manager) VerifyServiceKey(key string) error {
	if _, err := m.ServiceKey(key); err != nil {
		return err
	}
	return nil
}

func (m *Manager) NewServiceKey(description string) (*auth.ServiceKey, error) {
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

func (m *Manager) ChangePassword(username, password string) error {
	hash, err := m.authenticator.Hash(password)
	if err != nil {
		return err
	}
	if _, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": username}).Update(map[string]string{"password": hash}).Run(m.session); err != nil {
		return err
	}
	return nil
}

func (m *Manager) WebhookKey(key string) (*dockerhub.WebhookKey, error) {
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

func (m *Manager) WebhookKeys() ([]*dockerhub.WebhookKey, error) {
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

func (m *Manager) NewWebhookKey(image string) (*dockerhub.WebhookKey, error) {
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

func (m *Manager) SaveWebhookKey(key *dockerhub.WebhookKey) error {
	if _, err := r.Table(tblNameWebhookKeys).Insert(key).RunWrite(m.session); err != nil {
		return err

	}

	evt := &shipyard.Event{
		Type:    "add-webhook-key",
		Time:    time.Now(),
		Message: fmt.Sprintf("image=%s", key.Image),
		Tags:    []string{"docker", "webhook"},
	}

	if err := m.SaveEvent(evt); err != nil {
		return err
	}

	return nil
}
func (m *Manager) DeleteWebhookKey(id string) error {
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

	evt := &shipyard.Event{
		Type:    "delete-webhook-key",
		Time:    time.Now(),
		Message: fmt.Sprintf("image=%s key=%s", key.Image, key.Key),
		Tags:    []string{"docker", "webhook"},
	}

	if err := m.SaveEvent(evt); err != nil {
		return err

	}

	return nil
}
