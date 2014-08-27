package manager

import (
	"crypto/tls"
	"errors"
	"strings"
	"time"

	"github.com/citadel/citadel"
	"github.com/citadel/citadel/cluster"
	"github.com/citadel/citadel/scheduler"
	r "github.com/dancannon/gorethink"
	"github.com/gorilla/sessions"
	"github.com/shipyard/shipyard"
	"github.com/sirupsen/logrus"
)

const (
	tblNameConfig   = "config"
	tblNameEvents   = "events"
	tblNameAccounts = "accounts"
	storeKey        = "shipyard"
)

var (
	ErrAccountExists       = errors.New("account already exists")
	ErrAccountDoesNotExist = errors.New("account does not exist")
	ErrInvalidAuthToken    = errors.New("invalid auth token")
	logger                 = logrus.New()
	store                  = sessions.NewCookieStore([]byte(storeKey))
)

type (
	Manager struct {
		address        string
		database       string
		session        *r.Session
		clusterManager *cluster.Cluster
		engines        []*shipyard.Engine
		authenticator  *shipyard.Authenticator
		store          *sessions.CookieStore
		StoreKey       string
	}
)

func NewManager(addr string, database string) (*Manager, error) {
	session, err := r.Connect(r.ConnectOpts{
		Address:     addr,
		Database:    database,
		MaxIdle:     10,
		IdleTimeout: time.Second * 30,
	})
	if err != nil {
		return nil, err
	}
	logger.Info("checking database")
	r.DbCreate(database).Run(session)
	m := &Manager{
		address:       addr,
		database:      database,
		session:       session,
		authenticator: &shipyard.Authenticator{},
		store:         store,
		StoreKey:      storeKey,
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
	tables := []string{tblNameConfig, tblNameEvents, tblNameAccounts}
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
	return engines
}

func (m *Manager) Engines() []*shipyard.Engine {
	return m.engines
}

func (m *Manager) Engine(id string) *shipyard.Engine {
	for _, e := range m.engines {
		if e.Engine.ID == id {
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

func (m *Manager) RemoveEngine(id string) error {
	var engine *shipyard.Engine
	res, err := r.Table(tblNameConfig).Get(id).Run(m.session)
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
	containers, err := m.clusterManager.ListContainers()
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

func (m *Manager) ClusterInfo() (*citadel.ClusterInfo, error) {
	info, err := m.clusterManager.ClusterInfo()
	if err != nil {
		return nil, err
	}
	return info, nil
}

func (m *Manager) SaveEvent(event *shipyard.Event) error {
	if _, err := r.Table(tblNameEvents).Insert(event).RunWrite(m.session); err != nil {
		return err
	}
	return nil
}

func (m *Manager) Events(limit int) ([]*shipyard.Event, error) {
	res, err := r.Table(tblNameEvents).OrderBy(r.Desc("Time")).Limit(limit).Run(m.session)
	if err != nil {
		return nil, err
	}
	var events []*shipyard.Event
	if err := res.All(&events); err != nil {
		return nil, err
	}
	return events, nil
}

func (m *Manager) Accounts() ([]*shipyard.Account, error) {
	res, err := r.Table(tblNameAccounts).OrderBy(r.Asc("username")).Run(m.session)
	if err != nil {
		return nil, err
	}
	var accounts []*shipyard.Account
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
		if _, err := r.Table(tblNameAccounts).Update(account).RunWrite(m.session); err != nil {
			return err
		}
		return nil
	}
	if _, err := r.Table(tblNameAccounts).Insert(account).RunWrite(m.session); err != nil {
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
	return nil
}

func (m *Manager) Authenticate(username, password string) bool {
	acct, err := m.Account(username)
	if err != nil {
		return false
	}
	return m.authenticator.Authenticate(password, acct.Password)
}

func (m *Manager) NewAuthToken(username string) (*shipyard.AuthToken, error) {
	token, err := m.authenticator.GenerateToken()
	if err != nil {
		return nil, err
	}
	if _, err := r.Table(tblNameAccounts).Filter(map[string]string{"username": username}).Update(map[string]string{"token": token}).Run(m.session); err != nil {
		return nil, err
	}
	tk := &shipyard.AuthToken{Token: token}
	return tk, nil
}

func (m *Manager) VerifyAuthToken(username, token string) error {
	acct, err := m.Account(username)
	if err != nil {
		return err
	}
	if token != acct.Token {
		return ErrInvalidAuthToken
	}
	return nil
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
