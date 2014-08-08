package main

import (
	"crypto/tls"
	"time"

	"github.com/citadel/citadel"
	"github.com/citadel/citadel/cluster"
	"github.com/citadel/citadel/scheduler"
	r "github.com/dancannon/gorethink"
	"github.com/shipyard/shipyard"
)

type (
	Manager struct {
		address        string
		database       string
		session        *r.Session
		clusterManager *cluster.Cluster
		engines        []*shipyard.Engine
	}
)

const (
	tblNameConfig = "config"
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
	m := &Manager{
		address:  addr,
		database: database,
		session:  session,
	}
	m.initdb()
	m.init()
	return m, nil
}

func (m *Manager) initdb() {
	// create tables if needed
	_, err := r.Table(tblNameConfig).Run(m.session)
	if err != nil {
		if _, err := r.Db(m.database).TableCreate(tblNameConfig).Run(m.session); err != nil {
			logger.Fatalf("error creating table: %s", err)
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

func (m *Manager) AddEngine(engine *shipyard.Engine) error {
	if _, err := r.Table(tblNameConfig).Insert(engine).RunWrite(m.session); err != nil {
		return err
	}
	m.init()
	return nil
}

func (m *Manager) RemoveEngine(id string) error {
	if _, err := r.Table(tblNameConfig).Get(id).Delete().RunWrite(m.session); err != nil {
		return err
	}
	m.init()
	return nil
}
