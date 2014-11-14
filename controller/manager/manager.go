package manager

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/citadel/citadel"
	"github.com/citadel/citadel/cluster"
	"github.com/citadel/citadel/scheduler"
	r "github.com/dancannon/gorethink"
	"github.com/gorilla/sessions"
	"github.com/shipyard/shipyard"
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
	TRACKER_HOST       = "http://tracker.shipyard-project.com"
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
	logger                    = logrus.New()
	store                     = sessions.NewCookieStore([]byte(storeKey))
)

type (
	Manager struct {
		address          string
		database         string
		authKey          string
		session          *r.Session
		clusterManager   *cluster.Cluster
		engines          []*shipyard.Engine
		authenticator    *shipyard.Authenticator
		store            *sessions.CookieStore
		StoreKey         string
		version          string
		disableUsageInfo bool
	}
)

func NewManager(addr string, database string, authKey string, version string, disableUsageInfo bool) (*Manager, error) {
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
	logger.Info("checking database")
	r.DbCreate(database).Run(session)
	m := &Manager{
		address:          addr,
		database:         database,
		authKey:          authKey,
		session:          session,
		authenticator:    &shipyard.Authenticator{},
		store:            store,
		StoreKey:         storeKey,
		version:          version,
		disableUsageInfo: disableUsageInfo,
	}
	m.initdb()
	m.init()
	return m, nil
}

func (m *Manager) ClusterManager() *cluster.Cluster {
	return m.clusterManager
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
				logger.Fatalf("error creating table: %s", err)
			}
		}
	}
}

func (m *Manager) init() []*shipyard.Engine {
	engines := []*shipyard.Engine{}
	res, err := r.Table(tblNameConfig).Run(m.session)
	if err != nil {
		logger.Fatalf("error getting configuration: %s", err)
	}
	if err := res.All(&engines); err != nil {
		logger.Fatalf("error loading configuration: %s", err)
	}
	m.engines = engines
	var engs []*citadel.Engine
	for _, d := range engines {
		tlsConfig := &tls.Config{}
		if d.CACertificate != "" && d.SSLCertificate != "" && d.SSLKey != "" {
			caCert := []byte(d.CACertificate)
			sslCert := []byte(d.SSLCertificate)
			sslKey := []byte(d.SSLKey)
			c, err := getTLSConfig(caCert, sslCert, sslKey)
			if err != nil {
				logger.Errorf("error getting tls config: %s", err)
			}
			tlsConfig = c
		}
		if err := setEngineClient(d.Engine, tlsConfig); err != nil {
			logger.Errorf("error setting tls config for engine: %s", err)
		}
		engs = append(engs, d.Engine)
		logger.Infof("loaded engine id=%s addr=%s", d.Engine.ID, d.Engine.Addr)
	}
	clusterManager, err := cluster.New(scheduler.NewResourceManager(), engs...)
	if err != nil {
		logger.Fatal(err)
	}
	if err := clusterManager.Events(&EventHandler{Manager: m}); err != nil {
		logger.Fatalf("unable to register event handler: %s", err)
	}
	var (
		labelScheduler  = &scheduler.LabelScheduler{}
		uniqueScheduler = &scheduler.UniqueScheduler{}
		hostScheduler   = &scheduler.HostScheduler{}

		multiScheduler = scheduler.NewMultiScheduler(
			labelScheduler,
			uniqueScheduler,
		)
	)
	// TODO: refactor to be configurable
	clusterManager.RegisterScheduler("service", labelScheduler)
	clusterManager.RegisterScheduler("unique", uniqueScheduler)
	clusterManager.RegisterScheduler("multi", multiScheduler)
	clusterManager.RegisterScheduler("host", hostScheduler)
	m.clusterManager = clusterManager
	// start extension health check
	go m.extensionHealthCheck()
	// start engine health check
	go m.engineHealthCheck()
	// anonymous usage info
	go m.usageReport()
	return engines
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
	info, err := m.clusterManager.ClusterInfo()
	if err != nil {
		logger.Warnf("error getting cluster info for usage: %s", err)
		return
	}
	usage := &shipyard.Usage{
		ID:              id,
		Version:         m.version,
		NumOfEngines:    info.EngineCount,
		NumOfImages:     info.ImageCount,
		NumOfContainers: info.ContainerCount,
		TotalCpus:       info.Cpus,
		TotalMemory:     info.Memory,
	}
	b, err := json.Marshal(usage)
	if err != nil {
		logger.Warnf("error serializing usage info: %s", err)
	}
	buf := bytes.NewBuffer(b)
	if _, err := http.Post(fmt.Sprintf("%s/update", TRACKER_HOST), "application/json", buf); err != nil {
		logger.Warnf("error sending usage info: %s", err)
	}
}

func (m *Manager) extensionHealthCheck() {
	t := time.NewTicker(time.Second * 1).C
	for {
		select {
		case <-t:
			exts, err := m.Extensions()
			if err != nil {
				logger.Warnf("error running extension health check: %s", err)
				return
			}
			for _, ext := range exts {
				var once sync.Once
				once.Do(func() { m.checkExtensionHealth(ext) })
			}
		}
	}
}

func (m *Manager) checkExtensionHealth(ext *shipyard.Extension) error {
	containers, err := m.Containers(true)
	if err != nil {
		logger.Warnf("error running extension health check: %s", err)
		return err
	}
	engs := m.Engines()
	engines := []*citadel.Engine{}
	for _, eng := range engs {
		engines = append(engines, eng.Engine)
	}
	extEngines := []*citadel.Engine{}
	for _, c := range containers {
		if val, ok := c.Image.Environment["_SHIPYARD_EXTENSION"]; ok {
			// check if the same parent extension
			if val == ext.ID {
				extEngines = append(extEngines, c.Engine)
			}
		}
	}
	if len(extEngines) == 0 || ext.Config.DeployPerEngine && len(extEngines) < len(engines) {
		logger.Infof("recovering extension %s", ext.Name)
		// extension is missing a container; deploy
		if err := m.RegisterExtension(ext); err != nil {
			logger.Warnf("error recovering extension: %s", err)
		}
	}
	return nil
}

func (m *Manager) engineHealthCheck() {
	t := time.NewTicker(time.Second * 10).C
	for {
		select {
		case <-t:
			engs := m.Engines()
			for _, eng := range engs {
				uri := fmt.Sprintf("%s/v1.15/info", eng.Engine.Addr)
				resp, err := http.Get(uri)
				health := &shipyard.Health{}
				if err != nil {
					health.Status = EngineHealthDown
				} else {
					defer resp.Body.Close()
					if resp.StatusCode != 200 {
						health.Status = EngineHealthDown
					} else {
						health.Status = EngineHealthUp
					}
				}
				eng.Health = health
				m.SaveEngine(eng)
			}

		}
	}
}

func (m *Manager) Engines() []*shipyard.Engine {
	return m.engines
}

func (m *Manager) Engine(id string) *shipyard.Engine {
	for _, e := range m.engines {
		if e.ID == id {
			return e
		}
	}
	return nil
}

func (m *Manager) AddEngine(engine *shipyard.Engine) error {
	if _, err := r.Table(tblNameConfig).Insert(engine).RunWrite(m.session); err != nil {
		return err
	}
	m.init()
	evt := &shipyard.Event{
		Type:   "add-engine",
		Time:   time.Now(),
		Engine: engine.Engine,
		Tags:   []string{"cluster"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}

func (m *Manager) SaveEngine(engine *shipyard.Engine) error {
	if _, err := r.Table(tblNameConfig).Replace(engine).RunWrite(m.session); err != nil {
		return err
	}
	return nil
}

func (m *Manager) RemoveEngine(id string) error {
	var engine *shipyard.Engine
	res, err := r.Table(tblNameConfig).Filter(map[string]string{"id": id}).Run(m.session)
	if err != nil {
		return err
	}
	if err := res.One(&engine); err != nil {
		if err == r.ErrEmptyResult {
			return nil
		}
		return err
	}
	evt := &shipyard.Event{
		Type:   "remove-engine",
		Time:   time.Now(),
		Engine: engine.Engine,
		Tags:   []string{"cluster"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	if _, err := r.Table(tblNameConfig).Get(id).Delete().RunWrite(m.session); err != nil {
		return err
	}
	m.init()
	return nil
}

func (m *Manager) Container(id string) (*citadel.Container, error) {
	containers, err := m.clusterManager.ListContainers(true)
	if err != nil {
		return nil, err
	}
	for _, cnt := range containers {
		if strings.HasPrefix(cnt.ID, id) {
			return cnt, nil
		}
	}
	return nil, nil
}

func (m *Manager) Logs(container *citadel.Container, stdout bool, stderr bool) (io.ReadCloser, error) {
	data, err := m.clusterManager.Logs(container, stdout, stderr)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (m *Manager) Containers(all bool) ([]*citadel.Container, error) {
	return m.clusterManager.ListContainers(all)
}

func (m *Manager) ContainersByImage(name string, all bool) ([]*citadel.Container, error) {
	allContainers, err := m.Containers(all)
	if err != nil {
		return nil, err
	}
	imageContainers := []*citadel.Container{}
	for _, c := range allContainers {
		if strings.Index(c.Image.Name, name) > -1 {
			imageContainers = append(imageContainers, c)
		}
	}
	return imageContainers, nil
}

func (m *Manager) IdenticalContainers(container *citadel.Container, all bool) ([]*citadel.Container, error) {
	containers := []*citadel.Container{}
	imageContainers, err := m.ContainersByImage(container.Image.Name, all)
	if err != nil {
		return nil, err
	}
	for _, c := range imageContainers {
		args := len(c.Image.Args)
		origArgs := len(container.Image.Args)
		if c.Image.Memory == container.Image.Memory && args == origArgs && c.Image.Type == container.Image.Type {
			containers = append(containers, c)
		}
	}
	return containers, nil
}

func (m *Manager) ClusterInfo() (*shipyard.ClusterInfo, error) {
	info, err := m.clusterManager.ClusterInfo()
	clusterInfo := &shipyard.ClusterInfo{
		Cpus:           info.Cpus,
		Memory:         info.Memory,
		ContainerCount: info.ContainerCount,
		EngineCount:    info.EngineCount,
		ImageCount:     info.ImageCount,
		ReservedCpus:   info.ReservedCpus,
		ReservedMemory: info.ReservedMemory,
		Version:        m.version,
	}
	if err != nil {
		return nil, err
	}
	return clusterInfo, nil
}

func (m *Manager) Destroy(container *citadel.Container) error {
	if err := m.ClusterManager().Kill(container, 9); err != nil {
		return err
	}
	if err := m.ClusterManager().Remove(container); err != nil {
		return err
	}
	return nil
}

func (m *Manager) SaveServiceKey(key *shipyard.ServiceKey) error {
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

func (m *Manager) ServiceKey(key string) (*shipyard.ServiceKey, error) {
	res, err := r.Table(tblNameServiceKeys).Filter(map[string]string{"key": key}).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrServiceKeyDoesNotExist
	}
	var k *shipyard.ServiceKey
	if err := res.One(&k); err != nil {
		return nil, err
	}
	return k, nil
}

func (m *Manager) ServiceKeys() ([]*shipyard.ServiceKey, error) {
	res, err := r.Table(tblNameServiceKeys).Run(m.session)
	if err != nil {
		return nil, err
	}
	keys := []*shipyard.ServiceKey{}
	if err := res.All(&keys); err != nil {
		return nil, err
	}
	return keys, nil
}

func (m *Manager) Accounts() ([]*shipyard.Account, error) {
	res, err := r.Table(tblNameAccounts).OrderBy(r.Asc("username")).Run(m.session)
	if err != nil {
		return nil, err
	}
	accounts := []*shipyard.Account{}
	if err := res.All(&accounts); err != nil {
		return nil, err
	}
	return accounts, nil
}

func (m *Manager) Account(username string) (*shipyard.Account, error) {
	res, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": username}).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrAccountDoesNotExist
	}
	var account *shipyard.Account
	if err := res.One(&account); err != nil {
		return nil, err
	}
	return account, nil
}

func (m *Manager) SaveAccount(account *shipyard.Account) error {
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
		Message: fmt.Sprintf("name=%s", account.Username),
		Tags:    []string{"cluster", "security"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}

func (m *Manager) DeleteAccount(account *shipyard.Account) error {
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
		Message: fmt.Sprintf("name=%s", account.Username),
		Tags:    []string{"cluster", "security"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	return nil
}

func (m *Manager) Roles() ([]*shipyard.Role, error) {
	res, err := r.Table(tblNameRoles).OrderBy(r.Asc("name")).Run(m.session)
	if err != nil {
		return nil, err
	}
	roles := []*shipyard.Role{}
	if err := res.All(&roles); err != nil {
		return nil, err
	}
	return roles, nil
}

func (m *Manager) Role(name string) (*shipyard.Role, error) {
	res, err := r.Table(tblNameRoles).Filter(map[string]string{"name": name}).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrRoleDoesNotExist
	}
	var role *shipyard.Role
	if err := res.One(&role); err != nil {
		return nil, err
	}
	return role, nil
}

func (m *Manager) SaveRole(role *shipyard.Role) error {
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

func (m *Manager) DeleteRole(role *shipyard.Role) error {
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
		logger.Error(err)
		return false
	}
	return m.authenticator.Authenticate(password, acct.Password)
}

func (m *Manager) NewAuthToken(username string, userAgent string) (*shipyard.AuthToken, error) {
	tk, err := m.authenticator.GenerateToken()
	if err != nil {
		return nil, err
	}
	if err != nil {
		return nil, err
	}
	acct, err := m.Account(username)
	if err != nil {
		return nil, err
	}
	token := &shipyard.AuthToken{}
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
		token = &shipyard.AuthToken{
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

func (m *Manager) NewServiceKey(description string) (*shipyard.ServiceKey, error) {
	k, err := m.authenticator.GenerateToken()
	if err != nil {
		return nil, err
	}
	key := &shipyard.ServiceKey{
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

func (m *Manager) Extensions() ([]*shipyard.Extension, error) {
	res, err := r.Table(tblNameExtensions).OrderBy(r.Asc("name")).Run(m.session)
	if err != nil {
		return nil, err
	}
	exts := []*shipyard.Extension{}
	if err := res.All(&exts); err != nil {
		return nil, err
	}
	return exts, nil
}

func (m *Manager) Extension(id string) (*shipyard.Extension, error) {
	res, err := r.Table(tblNameExtensions).Get(id).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrExtensionDoesNotExist
	}
	var ext *shipyard.Extension
	if err := res.One(&ext); err != nil {
		return nil, err
	}
	return ext, nil
}

func (m *Manager) SaveExtension(ext *shipyard.Extension) error {
	res, err := r.Table(tblNameExtensions).Insert(ext).RunWrite(m.session)
	if err != nil {
		return err
	}
	evt := &shipyard.Event{
		Type:    "add-extension",
		Time:    time.Now(),
		Message: fmt.Sprintf("name=%s version=%s author=%s", ext.Name, ext.Version, ext.Author),
		Tags:    []string{"cluster"},
	}
	if err := m.SaveEvent(evt); err != nil {
		return err
	}
	key := res.GeneratedKeys[0]
	ext.ID = key
	// register
	if err := m.RegisterExtension(ext); err != nil {
		return err
	}
	return nil
}

func (m *Manager) RegisterExtension(ext *shipyard.Extension) error {
	if ext.Config.Environment == nil {
		env := make(map[string]string)
		ext.Config.Environment = env
	}
	ext.Config.Environment["_SHIPYARD_EXTENSION"] = ext.ID
	rp := citadel.RestartPolicy{
		Name:              "on-failure",
		MaximumRetryCount: 10,
	}
	image := &citadel.Image{
		Name:          ext.Image,
		ContainerName: ext.Config.ContainerName,
		Cpus:          ext.Config.Cpus,
		Memory:        ext.Config.Memory,
		Environment:   ext.Config.Environment,
		Links:         ext.Config.Links,
		Args:          ext.Config.Args,
		Volumes:       ext.Config.Volumes,
		BindPorts:     ext.Config.Ports,
		Labels:        []string{},
		Type:          "service",
		RestartPolicy: rp,
	}
	if ext.Config.DeployPerEngine {
		engs := m.clusterManager.Engines()
		extEngines := []*citadel.Engine{}
		containers, err := m.Containers(true)
		if err != nil {
			return err
		}
		for _, c := range containers {
			if v, ok := c.Image.Environment["_SHIPYARD_EXTENSION"]; ok {
				if v == ext.ID {
					extEngines = append(extEngines, c.Engine)
				}
			}
		}
		for _, eng := range engs {
			// skip if already present
			for _, xe := range extEngines {
				if xe == eng {
					continue
				}
			}
			image.Type = "host"
			labels := []string{fmt.Sprintf("host:%s", eng.ID)}
			image.Labels = labels
			container, err := m.clusterManager.Start(image, true)
			if err != nil {
				logger.Errorf("error running %s for extension image %s: %s", image.Name, ext.Name, err)
				return err
			}
			logger.Infof("started %s (%s) for extension %s", container.ID[:8], image.Name, ext.Name)
		}
	} else {
		container, err := m.clusterManager.Start(image, true)
		if err != nil {
			logger.Errorf("error running %s for extension image %s: %s", image.Name, ext.Name, err)
			return err
		}
		logger.Infof("started %s (%s) for extension %s", container.ID[:8], image.Name, ext.Name)
	}
	logger.Infof("registered extension name=%s version=%s author=%s", ext.Name, ext.Version, ext.Author)
	return nil
}

func (m *Manager) UnregisterExtension(ext *shipyard.Extension) error {
	// remove containers that are linked to extension
	containers, err := m.clusterManager.ListContainers(true)
	if err != nil {
		return err
	}
	for _, c := range containers {
		// check if has the extension env var
		if val, ok := c.Image.Environment["_SHIPYARD_EXTENSION"]; ok {
			// check if the same parent extension
			if val == ext.ID {
				logger.Infof("terminating extension (%s) container %s", ext.Name, c.ID[:8])
				if err := m.clusterManager.Kill(c, 9); err != nil {
					logger.Warnf("error terminating extension (%s) container %s: %s", ext.Name, c.ID[:8], err)
				}
				if err := m.clusterManager.Remove(c); err != nil {
					logger.Warnf("error removing extension (%s) container %s: %s", ext.Name, c.ID[:8], err)
				}
			}
		}
	}
	logger.Infof("un-registered extension name=%s version=%s author=%s", ext.Name, ext.Version, ext.Author)
	return nil
}

func (m *Manager) DeleteExtension(id string) error {
	ext, err := m.Extension(id)
	if err != nil {
		return err
	}
	if err := m.UnregisterExtension(ext); err != nil {
		return err
	}
	res, err := r.Table(tblNameExtensions).Get(id).Delete().Run(m.session)
	if err != nil {
		return err
	}
	if res.IsNil() {
		return ErrExtensionDoesNotExist
	}
	return nil
}

func (m *Manager) RedeployContainers(image string) error {
	var img *citadel.Image
	containers, err := m.Containers(false)
	if err != nil {
		return err
	}
	deployed := false
	for _, c := range containers {
		if strings.Index(c.Image.Name, image) > -1 {
			img = c.Image
			logger.Infof("pulling latest image for %s", image)
			if err := c.Engine.Pull(image); err != nil {
				return err
			}
			m.Destroy(c)
			// in order to keep fast deploys, we must deploy
			// to the same host that the image was running on previously
			img.Type = "host"
			lbl := fmt.Sprintf("host:%s", c.Engine.ID)
			img.Labels = []string{lbl}
			nc, err := m.ClusterManager().Start(img, false)
			if err != nil {
				return err
			}
			deployed = true
			logger.Infof("deployed updated container %s via webhook for %s", nc.ID[:8], image)
		}
	}
	if deployed {
		evt := &shipyard.Event{
			Type:    "deploy",
			Message: fmt.Sprintf("%s deployed", image),
			Time:    time.Now(),
			Tags:    []string{"deploy"},
		}
		if err := m.SaveEvent(evt); err != nil {
			return err
		}
	}
	return nil
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

func (m *Manager) Run(image *citadel.Image, count int, pull bool) ([]*citadel.Container, error) {
	launched := []*citadel.Container{}

	var wg sync.WaitGroup
	wg.Add(count)
	var runErr error
	for i := 0; i < count; i++ {
		go func(wg *sync.WaitGroup) {
			container, err := m.ClusterManager().Start(image, pull)
			if err != nil {
				runErr = err
			}
			launched = append(launched, container)
			wg.Done()
		}(&wg)
	}
	wg.Wait()
	return launched, runErr
}

func (m *Manager) Scale(container *citadel.Container, count int) error {
	imageContainers, err := m.IdenticalContainers(container, true)
	if err != nil {
		return err
	}
	containerCount := len(imageContainers)
	// check which way we need to scale
	if containerCount > count { // down
		numKill := containerCount - count
		delContainers := imageContainers[0:numKill]
		for _, c := range delContainers {
			if err := m.Destroy(c); err != nil {
				return err
			}
		}
	} else if containerCount < count { // up
		numAdd := count - containerCount
		// check for vols or links -- if so, launch on same engine
		img := container.Image
		if len(img.Volumes) > 0 || len(img.Links) > 0 {
			eng := container.Engine
			t := fmt.Sprintf("host:%s", eng.ID)
			lbls := img.Labels
			lbls = append(lbls, t)
			img.Type = "host"
			img.Labels = lbls
		}
		// bindports must be updated to remove the hostport as they
		// will fail to start
		for _, p := range img.BindPorts {
			p.Port = 0
		}
		// reset hostname
		img.Hostname = ""
		m.Run(img, numAdd, false)
	} else { // none
		logger.Info("no need to scale")
	}
	return nil
}
