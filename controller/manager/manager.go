package manager

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	log "github.com/Sirupsen/logrus"
	r "github.com/dancannon/gorethink"
	"github.com/gorilla/sessions"
	"github.com/samalba/dockerclient"
	c "github.com/shipyard/shipyard/checker"
	"github.com/shipyard/shipyard/model"
	"github.com/shipyard/shipyard/model/dockerhub"
	"github.com/shipyard/shipyard/utils/auth"
	"github.com/shipyard/shipyard/version"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"
)

const (
	tblNameConfig   = "config"
	tblNameEvents   = "events"
	tblNameAccounts = "accounts"

	tblNameProjects  = "projects"
	tblNameImages    = "images"
	tblNameResults   = "results"
	tblNameTests     = "tests"
	tblNameProviders = "providers"
	tblNameBuilds    = "builds"

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
	ErrAccountExists       = errors.New("account already exists")
	ErrAccountDoesNotExist = errors.New("account does not exist")

	ErrProjectExists        = errors.New("project already exists")
	ErrProjectDoesNotExist  = errors.New("project does not exist")
	ErrProjectImagesProblem = errors.New("problem retrieving images for project")

	ErrImageExists       = errors.New("image already exists")
	ErrImageDoesNotExist = errors.New("image does not exist")

	ErrResultExists       = errors.New("result already exists")
	ErrResultDoesNotExist = errors.New("result does not exist")

	ErrBuildExists       = errors.New("build already exists")
	ErrBuildDoesNotExist = errors.New("build does not exist")

	ErrTestExists          = errors.New("test already exists")
	ErrTestDoesNotExist    = errors.New("test does not exist")
	ErrProjectTestsProblem = errors.New("problem retrieving tests for project")

	ErrProviderExists       = errors.New("provider already exists")
	ErrProviderDoesNotExist = errors.New("provider does not exist")

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

		Projects() ([]*model.Project, error)
		Project(name string) (*model.Project, error)
		SaveProject(project *model.Project) error
		UpdateProject(project *model.Project) error
		DeleteProject(project *model.Project) error
		DeleteAllProjects() error

		VerifyIfImageExistsLocally(name string, tag string) bool

		Images() ([]*model.Image, error)
		ImagesByProjectId(projectId string) ([]*model.Image, error)
		Image(name string) (*model.Image, error)
		SaveImage(image *model.Image) error
		UpdateImage(image *model.Image) error
		DeleteImage(image *model.Image) error
		DeleteAllImages() error

		GetTests(projectId string) ([]*model.Test, error)
		GetTest(projectId, testId string) (*model.Test, error)
		CreateTest(projectId string, test *model.Test) error
		UpdateTest(projectId string, test *model.Test) error
		DeleteTest(projectId string, testId string) error
		DeleteAllTests() error

		GetResults(projectId string) (*model.Result, error)
		GetResult(projectId, resultId string) (*model.Result, error)
		CreateResult(projectId string, result *model.Result) error
		UpdateResult(projectId string, result *model.Result) error
		DeleteResult(projectId string, resultId string) error
		DeleteAllResults() error

		GetBuilds(projectId string, testId string) ([]*model.Build, error)
		GetBuild(projectId string, testId string, buildId string) (*model.Build, error)
		GetBuildById(buildId string) (*model.Build, error)
		GetBuildStatus(projectId string, testId string, buildId string) (string, error)

		CreateBuild(projectId string, testId string, buildAction *model.BuildAction) (string, error)
		UpdateBuildResults(buildId string, result model.BuildResult) error
		UpdateBuildStatus(buildId string, status string) error
		UpdateBuild(projectId string, testId string, buildId string, buildAction *model.BuildAction) error
		DeleteBuild(projectId string, testId string, buildId string) error
		DeleteAllBuilds() error

		GetProviders() ([]*model.Provider, error)
		GetProvider(providerId string) (*model.Provider, error)
		CreateProvider(provider *model.Provider) error
		UpdateProvider(provider *model.Provider) error
		DeleteProvider(providerId string) error
		GetJobsByProviderId(providerId string) ([]*model.ProviderJob, error)
		AddJobToProviderId(providerId string, job *model.ProviderJob) error
		DeleteAllProviders() error

		Roles() ([]*auth.ACL, error)
		Role(name string) (*auth.ACL, error)
		Store() *sessions.CookieStore
		StoreKey() string
		Container(id string) (*dockerclient.ContainerInfo, error)
		ScaleContainer(id string, numInstances int) ScaleResult
		SaveServiceKey(key *auth.ServiceKey) error
		RemoveServiceKey(key string) error
		SaveEvent(event *model.Event) error
		Events(limit int) ([]*model.Event, error)
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

		Nodes() ([]*model.Node, error)
		Node(name string) (*model.Node, error)

		AddRegistry(registry *model.Registry) error
		RemoveRegistry(registry *model.Registry) error
		Registries() ([]*model.Registry, error)
		Registry(name string) (*model.Registry, error)
		RegistryByAddress(addr string) (*model.Registry, error)

		CreateConsoleSession(c *model.ConsoleSession) error
		RemoveConsoleSession(c *model.ConsoleSession) error
		ConsoleSession(token string) (*model.ConsoleSession, error)
		ValidateConsoleSessionToken(containerId, token string) bool
	}
)

func NewManager(addr string, database string, authKey string, client *dockerclient.DockerClient, disableUsageInfo bool, authenticator auth.Authenticator) (Manager, error) {
	session, err := r.Connect(r.ConnectOpts{
		Address:  addr,
		Database: database,
		AuthKey:  authKey,
		MaxIdle:  10,
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
	tables := []string{tblNameConfig, tblNameEvents, tblNameAccounts, tblNameRoles, tblNameConsole, tblNameServiceKeys, tblNameRegistries, tblNameExtensions, tblNameWebhookKeys, tblNameProjects, tblNameImages, tblNameResults, tblNameTests, tblNameProviders, tblNameBuilds}
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
	evt := &model.Event{
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
	usage := &model.Usage{
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
			id, err := m.client.CreateContainer(config, "")
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

func (m DefaultManager) SaveEvent(event *model.Event) error {
	if _, err := r.Table(tblNameEvents).Insert(event).RunWrite(m.session); err != nil {
		return err
	}

	return nil
}

func (m DefaultManager) Events(limit int) ([]*model.Event, error) {
	t := r.Table(tblNameEvents).OrderBy(r.Desc("Time"))
	if limit > -1 {
		t.Limit(limit)
	}
	res, err := t.Run(m.session)
	if err != nil {
		return nil, err
	}
	events := []*model.Event{}
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
			return false, err
		}

		passwordHash = acct.Password
	}

	return m.authenticator.Authenticate(username, password, passwordHash)
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

func (m DefaultManager) Nodes() ([]*model.Node, error) {
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

func (m DefaultManager) Node(name string) (*model.Node, error) {
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

// methods related to the Project structure
func (m DefaultManager) Projects() ([]*model.Project, error) {
	// TODO: consider making sorting customizable
	// TODO: should filter by authorization
	// Return all projects **WITHOUT** their images embedded
	res, err := r.Table(tblNameProjects).OrderBy(r.Asc("creationTime")).Run(m.session)
	if err != nil {
		return nil, err
	}
	projects := []*model.Project{}
	if err := res.All(&projects); err != nil {
		return nil, err
	}

	return projects, nil
}

func (m DefaultManager) Project(id string) (*model.Project, error) {

	var project *model.Project

	res, err := r.Table(tblNameProjects).Filter(map[string]string{"id": id}).Run(m.session)

	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrProjectDoesNotExist
	}
	if err := res.One(&project); err != nil {
		return nil, err
	}

	project.Images, err = m.ImagesByProjectId(project.ID)

	if err != nil {
		return nil, ErrProjectImagesProblem
	}
	project.Tests, err = m.GetTests(project.ID)

	if err != nil {
		return nil, ErrProjectTestsProblem
	}

	return project, nil
}

func (m DefaultManager) SaveProject(project *model.Project) error {
	var eventType string
	proj, err := m.Project(project.ID)

	if err != nil && err != ErrProjectDoesNotExist {
		return err
	}
	if proj != nil {
		return ErrProjectExists
	}
	project.CreationTime = time.Now().UTC()
	project.UpdateTime = project.CreationTime
	// TODO: find a way to retrieve the current user
	project.Author = "author"

	//create the project
	response, err := r.Table(tblNameProjects).Insert(project).RunWrite(m.session)

	if err != nil {
		return err
	}

	// rethinkDB returns the ID as the first element of the GeneratedKeys slice
	// TODO: this method seems brittle, should contact the gorethink dev team for insight on this.
	project.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()

	//add the project ID to the images and save them in the Images table
	// TODO: investigate how to do a bulk insert
	for _, img := range project.Images {
		img.ProjectID = project.ID
		response, err = r.Table(tblNameImages).Insert(img).RunWrite(m.session)

		if err != nil {
			return err
		}
	}
	//add project ID to the tests and save them in the Tests table
	// TODO: investigate how to do a bulk insert
	for _, test := range project.Tests {
		test.ProjectId = project.ID
		response, err = r.Table(tblNameTests).Insert(test).RunWrite(m.session)

		if err != nil {
			return err
		}
	}

	eventType = "add-project"
	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", project.ID, project.Name), []string{"security"})
	return nil
}

func (m DefaultManager) UpdateProject(project *model.Project) error {
	var eventType string
	// check if exists; if so, update
	proj, err := m.Project(project.ID)
	if err != nil && err != ErrProjectDoesNotExist {
		return err
	}
	// update
	if proj != nil {
		updates := map[string]interface{}{
			"name":        project.Name,
			"description": project.Description,
			"status":      project.Status,
			"needsBuild":  project.NeedsBuild,
			"updateTime":  time.Now().UTC(),
			// TODO: find a way to retrieve the current user
			"updatedBy": "updater",
		}

		//TODO: Find a more elegant approach
		// Retrieve images by projectId and delete them by their primary key id generated by rethink
		res, err := r.Table(tblNameImages).Filter(map[string]string{"projectId": proj.ID}).Run(m.session)
		if err != nil {
			return err
		}
		oldImages := []*model.Image{}
		if err := res.All(&oldImages); err != nil {
			return err
		}

		// Remove existing images for this project
		for _, oldImage := range oldImages {
			if _, err := r.Table(tblNameImages).Filter(map[string]string{"id": oldImage.ID}).Delete().Run(m.session); err != nil {
				return err
			}
		}

		// Insert all the images that are incoming from the request which should have the new and old ones
		// TODO: investigate how we can do bulk insert
		for _, newImage := range project.Images {
			newImage.ProjectID = proj.ID
			if _, err := r.Table(tblNameImages).Insert(newImage).RunWrite(m.session); err != nil {
				return err
			}
		}

		//TODO: Find a more elegant approach
		// Retrieve tests by projectId and delete them by their primary key id generated by rethink
		res, err = r.Table(tblNameTests).Filter(map[string]string{"projectId": proj.ID}).Run(m.session)
		if err != nil {
			return err
		}
		oldTests := []*model.Test{}
		if err := res.All(&oldTests); err != nil {
			return err
		}

		// Remove existing tests for this project
		for _, oldTest := range oldTests {
			if _, err := r.Table(tblNameTests).Filter(map[string]string{"id": oldTest.ID}).Delete().Run(m.session); err != nil {
				return err
			}
		}

		// Insert all the tests that are incoming from the request which should have the new and old ones
		// TODO: investigate how we can do bulk insert
		for _, newTest := range project.Tests {
			newTest.ProjectId = proj.ID
			if _, err := r.Table(tblNameTests).Insert(newTest).RunWrite(m.session); err != nil {
				return err
			}
		}
		if _, err := r.Table(tblNameProjects).Filter(map[string]string{"id": project.ID}).Update(updates).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-project"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", project.ID, project.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteProject(project *model.Project) error {
	res, err := r.Table(tblNameProjects).Filter(map[string]string{"id": project.ID}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrProjectDoesNotExist
	}
	res, err = r.Table(tblNameImages).Filter(map[string]string{"projectId": project.ID}).Run(m.session)
	if err != nil {
		return err
	}
	imagesToDelete := []*model.Image{}
	if err := res.All(&imagesToDelete); err != nil {
		return err
	}

	// Remove existing images for this project
	for _, imgToDelete := range imagesToDelete {
		if _, err := r.Table(tblNameImages).Filter(map[string]string{"id": imgToDelete.ID}).Delete().Run(m.session); err != nil {
			return err
		}
	}

	res, err = r.Table(tblNameTests).Filter(map[string]string{"projectId": project.ID}).Run(m.session)
	if err != nil {
		return err
	}
	testsToDelete := []*model.Test{}
	if err := res.All(&testsToDelete); err != nil {
		return err
	}

	// Remove existing tests for this project
	for _, testToDelete := range testsToDelete {
		if _, err := r.Table(tblNameTests).Filter(map[string]string{"id": testToDelete.ID}).Delete().Run(m.session); err != nil {
			return err
		}
	}

	m.logEvent("delete-project", fmt.Sprintf("id=%s, name=%s", project.ID, project.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAllProjects() error {
	_, err := r.Table(tblNameProjects).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}

// end methods related to the project structure

// check if an image exists
func (m DefaultManager) VerifyIfImageExistsLocally(name string, tag string) bool {
	imageToCheck := name + ":" + tag
	auth := dockerclient.AuthConfig{"", "", ""}

	images, err := m.client.ListImages(true)

	if err != nil {
		log.Fatal(err)
	}
	for _, img := range images {
		imageRepoTags := img.RepoTags
		for _, imageRepoTag := range imageRepoTags {
			if strings.Contains(imageRepoTag, imageToCheck) {
				fmt.Printf("Image %s exists locally ... Proceeding to check with clair ... \n", imageToCheck)
				return true
			}
		}

	}
	fmt.Printf("Image does not exist locally. Pulling image %s ... \n", imageToCheck)
	//get registry
	match, _ := regexp.MatchString(":[0-9]{4}/", imageToCheck)
	if match {
		parts := strings.Split(imageToCheck, "/")
		address := "https://" + parts[0]

		registry, err := m.RegistryByAddress(address)
		auth = dockerclient.AuthConfig{registry.Username, registry.Password, ""}
		if err != nil {
			log.Fatal(err)
		}
	}
	error := m.client.PullImage(imageToCheck, &auth)

	if error != nil {
		fmt.Printf("Could not pull image %s ... \n%s \n", imageToCheck, error)
		return false

	}
	return true
}

//methods related to the Image structure
func (m DefaultManager) Images() ([]*model.Image, error) {
	// TODO: sort by datetime once it is implemented
	res, err := r.Table(tblNameImages).OrderBy(r.Asc("name")).Run(m.session)
	if err != nil {
		return nil, err
	}
	images := []*model.Image{}
	if err := res.All(&images); err != nil {
		return nil, err
	}
	return images, nil
}

func (m DefaultManager) Image(id string) (*model.Image, error) {
	res, err := r.Table(tblNameImages).Filter(map[string]string{"id": id}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrImageDoesNotExist
	}
	var image *model.Image
	if err := res.One(&image); err != nil {
		return nil, err
	}
	return image, nil
}

func (m DefaultManager) ImagesByProjectId(projectId string) ([]*model.Image, error) {
	res, err := r.Table(tblNameImages).Filter(map[string]string{"projectId": projectId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	images := []*model.Image{}
	if err := res.All(&images); err != nil {
		return nil, err
	}
	return images, nil
}

func (m DefaultManager) SaveImage(image *model.Image) error {
	var eventType string

	img, err := m.Image(image.ID)
	if err != nil && err != ErrImageDoesNotExist {
		return err
	}
	if img != nil {
		return ErrImageExists
	}
	if _, err := r.Table(tblNameImages).Insert(image).RunWrite(m.session); err != nil {
		return err
	}
	eventType = "add-image"

	// TODO: consider adding "id" from the rethink GeneratedKeys to the Image object

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", image.ID, image.Name), []string{"security"})

	return nil
}

func (m DefaultManager) UpdateImage(image *model.Image) error {
	var eventType string

	// check if exists; if so, update
	img, err := m.Image(image.ID)
	if err != nil && err != ErrImageDoesNotExist {
		return err
	}
	// update
	if img != nil {
		updates := map[string]interface{}{
			"name":           image.Name,
			"imageId":        image.ImageId,
			"tag":            image.Tag,
			"description":    image.Description,
			"location":       image.Location,
			"skipImageBuild": image.SkipImageBuild,
			"projectId":      image.ProjectID,
		}

		if _, err := r.Table(tblNameImages).Filter(map[string]string{"id": image.ID}).Update(updates).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-image"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", image.ID, image.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteImage(image *model.Image) error {
	res, err := r.Table(tblNameImages).Filter(map[string]string{"id": image.ID}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrImageDoesNotExist
	}

	m.logEvent("delete-image", fmt.Sprintf("id=%s, name=%s", image.ID, image.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAllImages() error {
	_, err := r.Table(tblNameImages).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}

//methods related to Test structure

func (m DefaultManager) GetTests(projectId string) ([]*model.Test, error) {

	res, err := r.Table(tblNameTests).Filter(map[string]string{"projectId": projectId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	tests := []*model.Test{}
	if err := res.All(&tests); err != nil {
		return nil, err
	}
	return tests, nil
}

func (m DefaultManager) GetTest(projectId, testId string) (*model.Test, error) {
	var test *model.Test
	res, err := r.Table(tblNameTests).Filter(map[string]string{"id": testId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrTestDoesNotExist
	}
	if err := res.One(&test); err != nil {
		return nil, err
	}

	return test, nil
}

func (m DefaultManager) CreateTest(projectId string, test *model.Test) error {
	var eventType string
	test.ProjectId = projectId
	response, err := r.Table(tblNameTests).Insert(test).RunWrite(m.session)
	if err != nil {

		return err
	}
	test.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()
	eventType = "add-test"

	m.logEvent(eventType, fmt.Sprintf("id=%s", test.ID), []string{"security"})
	return nil
}

func (m DefaultManager) UpdateTest(projectId string, test *model.Test) error {
	var eventType string
	// check if exists; if so, update
	rez, err := m.GetTest(projectId, test.ID)
	if err != nil && err != ErrTestDoesNotExist {
		return err
	}
	// update
	if rez != nil {
		updates := map[string]interface{}{
			"projectId":        test.ProjectId,
			"description":      test.Description,
			"name":             test.Name,
			"targets":          test.Targets,
			"selectedTestType": test.SelectedTestType,
			"ProviderType":     test.Provider.ProviderType,
			"providerName":     test.Provider.ProviderName,
			"providerTest":     test.Provider.ProviderTest,
			"onSuccess":        test.Tagging.OnSuccess,
			"onFailure":        test.Tagging.OnFailure,
			"fromTag":          test.FromTag,
			"parameters":       test.Parameters,
		}
		if _, err := r.Table(tblNameTests).Filter(map[string]string{"id": test.ID}).Update(updates).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-test"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s", test.ID), []string{"security"})
	return nil
}

func (m DefaultManager) DeleteTest(projectId string, testId string) error {
	res, err := r.Table(tblNameTests).Filter(map[string]string{"id": testId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrTestDoesNotExist
	}

	m.logEvent("delete-test", fmt.Sprintf("id=%s", testId), []string{"security"})
	return nil
}
func (m DefaultManager) DeleteAllTests() error {
	_, err := r.Table(tblNameTests).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}

//methods related to the Build structure
func (m DefaultManager) GetBuilds(projectId string, testId string) ([]*model.Build, error) {
	res, err := r.Table(tblNameBuilds).Filter(map[string]string{"projectId": projectId, "testId": testId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	builds := []*model.Build{}
	if err := res.All(&builds); err != nil {
		return nil, err
	}
	return builds, nil
}

func (m DefaultManager) GetBuild(projectId string, testId string, buildId string) (*model.Build, error) {
	res, err := r.Table(tblNameBuilds).Filter(map[string]string{"projectId": projectId, "testId": testId, "id": buildId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrBuildDoesNotExist
	}
	var build *model.Build
	if err := res.One(&build); err != nil {
		return nil, err
	}
	return build, nil
}
func (m DefaultManager) GetBuildById(buildId string) (*model.Build, error) {
	res, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrBuildDoesNotExist
	}
	var build *model.Build
	if err := res.One(&build); err != nil {
		return nil, err
	}
	return build, nil
}

func (m DefaultManager) GetBuildStatus(projectId string, testId string, buildId string) (string, error) {
	res, err := r.Table(tblNameBuilds).Filter(map[string]string{"projectId": projectId, "testId": testId, "id": buildId}).Run(m.session)
	if err != nil {
		return "", err
	}
	if res.IsNil() {
		return "", ErrBuildDoesNotExist
	}
	var build *model.Build
	if err := res.One(&build); err != nil {
		return "", err
	}
	return build.Status.Status, nil
}

func (m DefaultManager) CreateBuild(projectId string, testId string, buildAction *model.BuildAction) (string, error) {
	var eventType string
	eventType = eventType
	var build *model.Build
	existingResult, _ := m.GetResults(projectId)
	if buildAction.Action == "start" {
		var testResult *model.TestResult
		var build *model.Build
		testResult = &model.TestResult{}
		build = &model.Build{}
		build.TestId = testId
		build.ProjectId = projectId
		build.StartTime = time.Now()
		// we get the project
		project, err := m.Project(projectId)
		if err != nil && err != ErrProjectDoesNotExist {
			return "", err
		}
		// we get the test and its targetArtifacts
		test, err := m.GetTest(projectId, testId)
		if err != nil && err != ErrTestDoesNotExist {
			return "", err
		}
		targetArtifacts := test.Targets

		// we get the ids for the targets we want to test

		targetIds := []string{}
		for _, target := range targetArtifacts {
			targetIds = append(targetIds, target.ArtifactId)

		}
		// we retrieve the images from the projectId

		projectImages, err := m.ImagesByProjectId(projectId)
		if err != nil && err != ErrProjectImagesProblem {
			return "", err
		}
		//we add the names of the matching images by comparing the ImageID with the ArtifactId
		imageNames := []string{}
		for _, image := range projectImages {
			for _, artifactId := range targetIds {
				if image.ID == artifactId {
					imageNames = append(imageNames, image.Name)
				}

			}
		}
		// we change the build's buildStatus to submitted
		build.Status = &model.BuildStatus{Status: "new"}
		// we add the build to the table in rethink db

		response, err := r.Table(tblNameBuilds).Insert(build).RunWrite(m.session)

		if err != nil {
			return "", err
		}
		eventType = "add-build"

		build.ID = func() string {
			if len(response.GeneratedKeys) > 0 {
				return string(response.GeneratedKeys[0])
			}
			return ""
		}()
		result := &model.Result{BuildId: build.ID, Author: "author", ProjectId: projectId, Description: project.Description, Updater: "author"}
		result.CreateDate = time.Now()
		done := make(chan bool)
		for _, name := range imageNames {
			// we instantiate fields for the testResult
			testResult.ImageName = name
			testResult.TestName = test.Name
			testResult.TestId = testId

			//we check if the image(s) we want to test exist(s) locally and pull them if not
			for _, image := range projectImages {
				if image.Name == name {
					go m.VerifyIfImageExistsLocally(image.Name, image.Tag)
					testResult.ImageId = image.ID
					testResult.DockerImageId = image.ImageId
				}
			}

			buildResult := model.BuildResult{}
			// we launch a go routine which checks the image
			go func() {
				buildResult, err = c.CheckImage(build.ID, name)
				// in the end we update the build results
				m.UpdateBuildResults(build.ID, buildResult)
				m.UpdateBuildStatus(build.ID, "running")
				done <- true
			}()
			// if we get an error we mark the test for the image as failed
			if err != nil {
				m.UpdateBuildStatus(build.ID, "finished_failed")
				testResult.SimpleResult.Status = "finished_failed"
				testResult.EndDate = time.Now()
				testResult.Blocker = false
				result.TestResults = append(result.TestResults, testResult)
				result.LastUpdate = time.Now()
				if existingResult != nil {
					err = m.UpdateResult(projectId, result)
					if err != nil {
						return "", err
					}
					return build.ID, err
				}
				if existingResult == nil {
					err = m.CreateResult(projectId, result)
					if err != nil {
						return "", err
					}
					return build.ID, err
				}
			}
			// if we don't get an error we mark the test for the image as successful
			if err == nil {
				m.UpdateBuildStatus(build.ID, "finished_success")
				testResult.SimpleResult.Status = "finished_success"
				testResult.EndDate = time.Now()
				testResult.Blocker = false
				result.TestResults = append(result.TestResults, testResult)
				result.LastUpdate = time.Now()
				if existingResult != nil {
					err = m.UpdateResult(projectId, result)
					if err != nil {
						return "", err
					}
					return build.ID, err
				}
				if existingResult == nil {
					err = m.CreateResult(projectId, result)
					if err != nil {
						return "", err
					}
					return build.ID, err
				}
			}
		}
		m.logEvent(eventType, fmt.Sprintf("id=%s", build.ID), []string{"security"})
		return build.ID, nil
	}
	return build.ID, nil
}

func (m DefaultManager) UpdateBuild(projectId string, testId string, buildId string, buildAction *model.BuildAction) error {
	var eventType string

	// check if exists; if so, update
	tmpBuild, err := m.GetBuild(projectId, testId, buildId)
	if err != nil && err != ErrBuildDoesNotExist {
		return err
	}
	// update
	if tmpBuild != nil {
		if buildAction.Action == "stop" {
			tmpBuild.Status.Status = "stopped"
			tmpBuild.EndTime = time.Now()
			// go StopCurrentBuildFromClair
		}
		if buildAction.Action == "restart" {
			tmpBuild.Status.Status = "restarted"
			tmpBuild.EndTime = time.Now()
			// go RestartCurrentBuildFromClair

		}

		/*	updates := map[string]interface{}{
			"startTime": build.StartTime,
			"endTime":   build.EndTime,
			"config":    build.Config,
			"results":   build.Results,
			"testId":    build.TestId,
			"projectId": build.ProjectId,
		}*/

		if _, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Update(tmpBuild).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-build"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil

}
func (m DefaultManager) UpdateBuildResults(buildId string, result model.BuildResult) error {
	var eventType string
	build, err := m.GetBuildById(buildId)
	if err != nil {
		return err
	}
	build.Results = append(build.Results, &result)

	if _, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Update(build).RunWrite(m.session); err != nil {
		return err
	}

	eventType = "update-build-results"

	m.logEvent(eventType, fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil
}
func (m DefaultManager) UpdateBuildStatus(buildId string, status string) error {
	var eventType string
	build, err := m.GetBuildById(buildId)
	if err != nil {
		return err
	}
	build.Status.Status = status

	if _, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Update(build).RunWrite(m.session); err != nil {
		return err
	}

	eventType = "update-build-status"

	m.logEvent(eventType, fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil
}
func (m DefaultManager) DeleteBuild(projectId string, testId string, buildId string) error {
	build, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if build.IsNil() {
		return ErrBuildDoesNotExist
	}

	m.logEvent("delete-build", fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAllBuilds() error {
	_, err := r.Table(tblNameBuilds).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}

// Methods related to the results structure
func (m DefaultManager) GetResults(projectId string) (*model.Result, error) {

	res, err := r.Table(tblNameResults).Filter(map[string]string{"projectId": projectId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	var result *model.Result
	if err := res.One(&result); err != nil {
		return nil, err
	}
	return result, nil
}

func (m DefaultManager) GetResult(projectId, resultId string) (*model.Result, error) {
	res, err := r.Table(tblNameResults).Filter(map[string]string{"id": resultId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrResultDoesNotExist
	}
	var result *model.Result
	if err := res.One(&result); err != nil {
		return nil, err
	}
	return result, nil
}

func (m DefaultManager) CreateResult(projectId string, result *model.Result) error {
	var eventType string

	tmpResult, err := m.GetResult(projectId, result.ID)
	if err != nil && err != ErrResultDoesNotExist {
		return err
	}

	if tmpResult != nil {
		return ErrResultExists
	}

	result.ProjectId = projectId
	response, err := r.Table(tblNameResults).Insert(result).RunWrite(m.session)

	if err != nil {
		return err
	}
	eventType = "add-result"

	result.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()

	m.logEvent(eventType, fmt.Sprintf("id=%s", result.ID), []string{"security"})

	return nil
}
func (m DefaultManager) UpdateResult(projectId string, inputResult *model.Result) error {
	var eventType string

	// check if exists; if so, update
	existingResult, err := m.GetResults(projectId)
	if err != nil && err != ErrResultDoesNotExist {
		return err
	}
	// update
	if existingResult != nil {
		for _, result := range inputResult.TestResults {
			existingResult.TestResults = append(existingResult.TestResults, result)
		}

		if _, err := r.Table(tblNameResults).Filter(map[string]string{"projectId": projectId}).Update(existingResult).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-result"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s", existingResult.ID), []string{"security"})

	return nil
}
func (m DefaultManager) DeleteResult(projectId string, resultId string) error {
	res, err := r.Table(tblNameResults).Filter(map[string]string{"id": resultId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrResultDoesNotExist
	}

	m.logEvent("delete-result", fmt.Sprintf("id=%s", resultId), []string{"security"})

	return nil
}
func (m DefaultManager) DeleteAllResults() error {
	_, err := r.Table(tblNameResults).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}

// Methods related to the Provider structure
func (m DefaultManager) GetProviders() ([]*model.Provider, error) {

	res, err := r.Table(tblNameProviders).OrderBy(r.Asc("name")).Run(m.session)
	if err != nil {
		return nil, err
	}
	providers := []*model.Provider{}
	if err := res.All(&providers); err != nil {
		return nil, err
	}
	return providers, nil
}

func (m DefaultManager) GetProvider(providerId string) (*model.Provider, error) {
	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrProviderDoesNotExist
	}
	var provider *model.Provider
	if err := res.One(&provider); err != nil {
		return nil, err
	}
	return provider, nil
}

func (m DefaultManager) CreateProvider(provider *model.Provider) error {
	var eventType string

	prov, err := m.GetProvider(provider.ID)
	if err != nil && err != ErrProviderDoesNotExist {
		return err
	}
	if prov != nil {
		return ErrProviderExists
	}

	response, err := r.Table(tblNameProviders).Insert(provider).RunWrite(m.session)

	if err != nil {
		return err
	}
	eventType = "add-provider"

	provider.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", provider.ID, provider.Name), []string{"security"})

	return nil
}

func (m DefaultManager) UpdateProvider(provider *model.Provider) error {
	var eventType string

	// check if exists; if so, update
	prov, err := m.GetProvider(provider.ID)
	if err != nil && err != ErrProviderDoesNotExist {
		return err
	}
	// update

	if prov != nil {
		updates := map[string]interface{}{
			"name":              provider.Name,
			"availableJobTypes": provider.AvailableJobTypes,
			"config":            provider.Config,
			"url":               provider.Url,
			"providerJobs":      provider.ProviderJobs,
		}

		if _, err := r.Table(tblNameProviders).Filter(map[string]string{"id": provider.ID}).Update(updates).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-provider"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", provider.ID, provider.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteProvider(providerId string) error {
	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrProviderDoesNotExist
	}

	m.logEvent("delete-provider", fmt.Sprintf("id=%s", providerId), []string{"security"})

	return nil
}

func (m DefaultManager) GetJobsByProviderId(providerId string) ([]*model.ProviderJob, error) {
	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrProviderDoesNotExist
	}
	var provider *model.Provider
	if err := res.One(&provider); err != nil {
		return nil, err
	}
	return provider.ProviderJobs, nil
}

func (m DefaultManager) AddJobToProviderId(providerId string, job *model.ProviderJob) error {

	var eventType string

	res, err := r.Table(tblNameProviders).Filter(map[string]string{"id": providerId}).Run(m.session)
	if err != nil {
		return err
	}
	if res.IsNil() {
		return ErrProviderDoesNotExist
	}
	var provider *model.Provider
	if err := res.One(&provider); err != nil {
		return err
	}

	provider.ProviderJobs = append(provider.ProviderJobs, job)

	if _, err := r.Table(tblNameProviders).Filter(map[string]string{"id": provider.ID}).Update(provider).RunWrite(m.session); err != nil {
		return err
	}
	eventType = "add-job-to-provider"

	m.logEvent(eventType, fmt.Sprintf("id=%s, name=%s", provider.ID, provider.Name), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAllProviders() error {
	_, err := r.Table(tblNameProviders).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}

// end methods related to the Image structure

func (m DefaultManager) AddRegistry(registry *model.Registry) error {

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

	if _, err := r.Table(tblNameRegistries).Insert(registry).RunWrite(m.session); err != nil {
		return err
	}

	m.logEvent("add-registry", fmt.Sprintf("name=%s endpoint=%s", registry.Name, registry.Addr), []string{"registry"})

	return nil
}

func (m DefaultManager) RemoveRegistry(registry *model.Registry) error {
	res, err := r.Table(tblNameRegistries).Get(registry.ID).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrRegistryDoesNotExist
	}

	m.logEvent("delete-registry", fmt.Sprintf("name=%s endpoint=%s", registry.Name, registry.Addr), []string{"registry"})

	return nil
}

func (m DefaultManager) Registries() ([]*model.Registry, error) {
	res, err := r.Table(tblNameRegistries).OrderBy(r.Asc("name")).Run(m.session)
	if err != nil {
		return nil, err
	}

	regs := []*model.Registry{}
	if err := res.All(&regs); err != nil {
		return nil, err
	}

	registries := []*model.Registry{}
	for _, r := range regs {
		reg, err := model.NewRegistry(r.ID, r.Name, r.Addr, r.Username, r.Password, r.TlsSkipVerify)
		if err != nil {
			return nil, err
		}

		registries = append(registries, reg)
	}

	return registries, nil
}

func (m DefaultManager) Registry(name string) (*model.Registry, error) {
	res, err := r.Table(tblNameRegistries).Filter(map[string]string{"name": name}).Run(m.session)
	if err != nil {
		return nil, err

	}
	if res.IsNil() {
		return nil, ErrRegistryDoesNotExist
	}
	var reg *model.Registry
	if err := res.One(&reg); err != nil {
		return nil, err
	}

	registry, err := model.NewRegistry(reg.ID, reg.Name, reg.Addr, reg.Username, reg.Password, reg.TlsSkipVerify)
	if err != nil {
		return nil, err
	}

	return registry, nil
}

func (m DefaultManager) RegistryByAddress(addr string) (*model.Registry, error) {
	res, err := r.Table(tblNameRegistries).Filter(map[string]string{"addr": addr}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		log.Debugf("its nil!! it found nothing")
		return nil, ErrRegistryDoesNotExist
	}
	var reg *model.Registry
	if err := res.One(&reg); err != nil {
		log.Debugf("problem with res.One")
		return nil, err
	}

	registry, err := model.NewRegistry(reg.ID, reg.Name, reg.Addr, reg.Username, reg.Password, reg.TlsSkipVerify)
	if err != nil {
		log.Debugf("Problem creating new registry")
		return nil, err
	}

	return registry, nil
}

func (m DefaultManager) CreateConsoleSession(c *model.ConsoleSession) error {
	if _, err := r.Table(tblNameConsole).Insert(c).RunWrite(m.session); err != nil {
		return err
	}

	m.logEvent("create-console-session", fmt.Sprintf("container=%s", c.ContainerID), []string{"console"})

	return nil
}

func (m DefaultManager) RemoveConsoleSession(c *model.ConsoleSession) error {
	res, err := r.Table(tblNameConsole).Get(c.ID).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrConsoleSessionDoesNotExist
	}

	return nil
}

func (m DefaultManager) ConsoleSession(token string) (*model.ConsoleSession, error) {
	res, err := r.Table(tblNameConsole).Filter(map[string]string{"token": token}).Run(m.session)
	if err != nil {
		return nil, err
	}

	if res.IsNil() {
		return nil, ErrConsoleSessionDoesNotExist
	}

	var c *model.ConsoleSession
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
