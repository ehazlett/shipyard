package gorethink

import (
	"sync"
	"sync/atomic"
	"time"

	"gopkg.in/fatih/pool.v2"

	p "github.com/dancannon/gorethink/ql2"
)

type Query struct {
	Type       p.Query_QueryType
	Token      int64
	Term       *Term
	GlobalOpts map[string]interface{}
}

func (q *Query) build() []interface{} {
	res := []interface{}{q.Type}
	if q.Term != nil {
		res = append(res, q.Term.build())
	}

	if len(q.GlobalOpts) > 0 {
		res = append(res, q.GlobalOpts)
	}

	return res
}

type Session struct {
	token      int64
	address    string
	database   string
	timeout    time.Duration
	authkey    string
	timeFormat string

	// Pool configuration options
	initialCap  int
	maxCap      int
	idleTimeout time.Duration

	// Response cache, used for batched responses
	sync.Mutex
	cache map[int64]*Cursor

	closed bool

	pool pool.Pool
}

func newSession(args map[string]interface{}) *Session {
	s := &Session{
		cache: map[int64]*Cursor{},
	}

	if token, ok := args["token"]; ok {
		s.token = token.(int64)
	}
	if address, ok := args["address"]; ok {
		s.address = address.(string)
	}
	if database, ok := args["database"]; ok {
		s.database = database.(string)
	}
	if timeout, ok := args["timeout"]; ok {
		s.timeout = timeout.(time.Duration)
	}
	if authkey, ok := args["authkey"]; ok {
		s.authkey = authkey.(string)
	}

	// Pool configuration options
	if initialCap, ok := args["initialCap"]; ok {
		s.initialCap = initialCap.(int)
	} else {
		s.initialCap = 5
	}
	if maxCap, ok := args["maxCap"]; ok {
		s.maxCap = maxCap.(int)
	} else {
		s.maxCap = 30
	}
	if idleTimeout, ok := args["idleTimeout"]; ok {
		s.idleTimeout = idleTimeout.(time.Duration)
	} else {
		s.idleTimeout = 10 * time.Second
	}

	return s
}

type ConnectOpts struct {
	Token       int64         `gorethink:"token,omitempty"`
	Address     string        `gorethink:"address,omitempty"`
	Database    string        `gorethink:"database,omitempty"`
	Timeout     time.Duration `gorethink:"timeout,omitempty"`
	AuthKey     string        `gorethink:"authkey,omitempty"`
	MaxIdle     int           `gorethink:"max_idle,omitempty"`
	MaxActive   int           `gorethink:"max_active,omitempty"`
	IdleTimeout time.Duration `gorethink:"idle_timeout,omitempty"`
}

func (o *ConnectOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Connect creates a new database session.
//
// Supported arguments include token, address, database, timeout, authkey,
// and timeFormat. Pool options include maxIdle, maxActive and idleTimeout.
//
// By default maxIdle and maxActive are set to 1: passing values greater
// than the default (e.g. maxIdle: "10", maxActive: "20") will provide a
// pool of re-usable connections.
//
// Basic connection example:
//
//	var session *r.Session
// 	session, err := r.Connect(r.ConnectOpts{
// 		Address:  "localhost:28015",
// 		Database: "test",
// 		AuthKey:  "14daak1cad13dj",
// 	})
func Connect(args ConnectOpts) (*Session, error) {
	s := newSession(args.toMap())
	err := s.Reconnect()

	return s, err
}

type CloseOpts struct {
	NoReplyWait bool `gorethink:"noreplyWait,omitempty"`
}

func (o *CloseOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Reconnect closes and re-opens a session.
func (s *Session) Reconnect(optArgs ...CloseOpts) error {
	if err := s.Close(optArgs...); err != nil {
		return err
	}

	s.closed = false
	if s.pool == nil {
		cp, err := pool.NewChannelPool(s.initialCap, s.maxCap, Dial(s))
		s.pool = cp
		if err != nil {
			return err
		}

		s.pool = cp
	}

	// Check the connection
	_, err := s.getConn()

	return err
}

// Close closes the session
func (s *Session) Close(optArgs ...CloseOpts) error {
	if s.closed {
		return nil
	}

	if len(optArgs) >= 1 {
		if optArgs[0].NoReplyWait {
			s.NoReplyWait()
		}
	}

	if s.pool != nil {
		s.pool.Close()
	}
	s.closed = true

	return nil
}

// noreplyWait ensures that previous queries with the noreply flag have been
// processed by the server. Note that this guarantee only applies to queries
// run on the given connection
func (s *Session) NoReplyWait() {
	s.noreplyWaitQuery()
}

// Use changes the default database used
func (s *Session) Use(database string) {
	s.database = database
}

// SetTimeout causes any future queries that are run on this session to timeout
// after the given duration, returning a timeout error.  Set to zero to disable.
func (s *Session) SetTimeout(timeout time.Duration) {
	s.timeout = timeout
}

// getToken generates the next query token, used to number requests and match
// responses with requests.
func (s *Session) nextToken() int64 {
	return atomic.AddInt64(&s.token, 1)
}

// startQuery creates a query from the term given and sends it to the server.
// The result from the server is returned as a cursor
func (s *Session) startQuery(t Term, opts map[string]interface{}) (*Cursor, error) {
	token := s.nextToken()

	// Build global options
	globalOpts := map[string]interface{}{}
	for k, v := range opts {
		globalOpts[k] = Expr(v).build()
	}

	// If no DB option was set default to the value set in the connection
	if _, ok := opts["db"]; !ok {
		globalOpts["db"] = Db(s.database).build()
	}

	// Construct query
	q := Query{
		Type:       p.Query_START,
		Token:      token,
		Term:       &t,
		GlobalOpts: globalOpts,
	}

	// Get a connection from the pool, do not close yet as it
	// might be needed later if a partial response is returned
	conn, err := s.getConn()
	if err != nil {
		return nil, err
	}

	return conn.SendQuery(s, q, opts, false)
}

func (s *Session) handleBatchResponse(cursor *Cursor, response *Response) {
	cursor.extend(response)

	s.Lock()
	cursor.outstandingRequests--

	if response.Type != p.Response_SUCCESS_PARTIAL &&
		response.Type != p.Response_SUCCESS_FEED &&
		cursor.outstandingRequests == 0 {
		delete(s.cache, response.Token)
	}
	s.Unlock()
}

// continueQuery continues a previously run query.
// This is needed if a response is batched.
func (s *Session) continueQuery(cursor *Cursor) error {
	err := s.asyncContinueQuery(cursor)
	if err != nil {
		return err
	}

	response, err := cursor.conn.ReadResponse(s, cursor.query.Token)
	if err != nil {
		return err
	}

	s.handleBatchResponse(cursor, response)

	return nil
}

// asyncContinueQuery asynchronously continues a previously run query.
// This is needed if a response is batched.
func (s *Session) asyncContinueQuery(cursor *Cursor) error {
	s.Lock()
	if cursor.outstandingRequests != 0 {

		s.Unlock()
		return nil
	}
	cursor.outstandingRequests = 1
	s.Unlock()

	q := Query{
		Type:  p.Query_CONTINUE,
		Token: cursor.query.Token,
	}

	_, err := cursor.conn.SendQuery(s, q, cursor.opts, true)
	if err != nil {
		return err
	}

	return nil
}

// stopQuery sends closes a query by sending Query_STOP to the server.
func (s *Session) stopQuery(cursor *Cursor) error {
	cursor.mu.Lock()
	cursor.outstandingRequests++
	cursor.mu.Unlock()

	q := Query{
		Type:  p.Query_STOP,
		Token: cursor.query.Token,
		Term:  &cursor.term,
	}

	_, err := cursor.conn.SendQuery(s, q, cursor.opts, false)
	if err != nil {
		return err
	}

	response, err := cursor.conn.ReadResponse(s, cursor.query.Token)
	if err != nil {
		return err
	}

	s.handleBatchResponse(cursor, response)

	return nil
}

// noreplyWaitQuery sends the NOREPLY_WAIT query to the server.
func (s *Session) noreplyWaitQuery() error {
	conn, err := s.getConn()
	if err != nil {
		return err
	}

	q := Query{
		Type:  p.Query_NOREPLY_WAIT,
		Token: s.nextToken(),
	}
	cur, err := conn.SendQuery(s, q, map[string]interface{}{}, false)
	if err != nil {
		return err
	}
	err = cur.Close()
	if err != nil {
		return err
	}

	return nil
}

func (s *Session) getConn() (*Connection, error) {
	if s.pool == nil {
		return nil, pool.ErrClosed
	}

	c, err := s.pool.Get()
	if err != nil {
		return nil, err
	}

	return &Connection{Conn: c, s: s}, nil
}

func (s *Session) checkCache(token int64) (*Cursor, bool) {
	s.Lock()
	defer s.Unlock()

	cursor, ok := s.cache[token]
	return cursor, ok
}

func (s *Session) setCache(token int64, cursor *Cursor) {
	s.Lock()
	defer s.Unlock()

	s.cache[token] = cursor
}
