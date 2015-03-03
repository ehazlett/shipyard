package gorethink

import (
	"encoding/json"
	"flag"
	"math/rand"
	"os"
	"runtime"
	"sync"
	"testing"
	"time"

	test "gopkg.in/check.v1"
)

var sess *Session
var debug = flag.Bool("gorethink.debug", false, "print query trees")
var url, db, authKey string

func init() {
	flag.Parse()

	// If the test is being run by wercker look for the rethink url
	url = os.Getenv("RETHINKDB_URL")
	if url == "" {
		url = "localhost:28015"
	}

	db = os.Getenv("RETHINKDB_DB")
	if db == "" {
		db = "test"
	}

	// Needed for running tests for RethinkDB with a non-empty authkey
	authKey = os.Getenv("RETHINKDB_AUTHKEY")
}

// Hook up gocheck into the gotest runner.
func Test(t *testing.T) { test.TestingT(t) }

type RethinkSuite struct{}

var _ = test.Suite(&RethinkSuite{})

func (s *RethinkSuite) SetUpSuite(c *test.C) {
	var err error
	sess, err = Connect(ConnectOpts{
		Address:   url,
		MaxIdle:   3,
		MaxActive: 3,
		AuthKey:   authKey,
	})
	c.Assert(err, test.IsNil)
}

func (s *RethinkSuite) TearDownSuite(c *test.C) {
	sess.Close()
}

type jsonChecker struct {
	info *test.CheckerInfo
}

func (j jsonChecker) Info() *test.CheckerInfo {
	return j.info
}

func (j jsonChecker) Check(params []interface{}, names []string) (result bool, error string) {
	var jsonParams []interface{}
	for _, param := range params {
		jsonParam, err := json.Marshal(param)
		if err != nil {
			return false, err.Error()
		}
		jsonParams = append(jsonParams, jsonParam)
	}
	return test.DeepEquals.Check(jsonParams, names)
}

// JsonEquals compares two interface{} objects by converting them to JSON and
// seeing if the strings match
var JsonEquals = &jsonChecker{
	&test.CheckerInfo{Name: "JsonEquals", Params: []string{"obtained", "expected"}},
}

// Expressions used in tests
var now = time.Now()
var arr = []interface{}{1, 2, 3, 4, 5, 6, 7, 8, 9}
var darr = []interface{}{1, 1, 2, 2, 3, 3, 5, 5, 6}
var narr = []interface{}{
	1, 2, 3, 4, 5, 6, []interface{}{
		7.1, 7.2, 7.3,
	},
}
var obj = map[string]interface{}{"a": 1, "b": 2, "c": 3}
var nobj = map[string]interface{}{
	"A": 1,
	"B": 2,
	"C": map[string]interface{}{
		"1": 3,
		"2": 4,
	},
}
var noDupNumObjList = []interface{}{
	map[string]interface{}{"id": 1, "g1": 1, "g2": 1, "num": 0},
	map[string]interface{}{"id": 2, "g1": 2, "g2": 2, "num": 5},
	map[string]interface{}{"id": 3, "g1": 3, "g2": 2, "num": 10},
	map[string]interface{}{"id": 5, "g1": 2, "g2": 3, "num": 100},
	map[string]interface{}{"id": 6, "g1": 1, "g2": 1, "num": 15},
	map[string]interface{}{"id": 8, "g1": 4, "g2": 2, "num": 50},
	map[string]interface{}{"id": 9, "g1": 2, "g2": 3, "num": 25},
}
var objList = []interface{}{
	map[string]interface{}{"id": 1, "g1": 1, "g2": 1, "num": 0},
	map[string]interface{}{"id": 2, "g1": 2, "g2": 2, "num": 5},
	map[string]interface{}{"id": 3, "g1": 3, "g2": 2, "num": 10},
	map[string]interface{}{"id": 4, "g1": 2, "g2": 3, "num": 0},
	map[string]interface{}{"id": 5, "g1": 2, "g2": 3, "num": 100},
	map[string]interface{}{"id": 6, "g1": 1, "g2": 1, "num": 15},
	map[string]interface{}{"id": 7, "g1": 1, "g2": 2, "num": 0},
	map[string]interface{}{"id": 8, "g1": 4, "g2": 2, "num": 50},
	map[string]interface{}{"id": 9, "g1": 2, "g2": 3, "num": 25},
}
var nameList = []interface{}{
	map[string]interface{}{"id": 1, "first_name": "John", "last_name": "Smith", "gender": "M"},
	map[string]interface{}{"id": 2, "first_name": "Jane", "last_name": "Smith", "gender": "F"},
}
var defaultObjList = []interface{}{
	map[string]interface{}{"a": 1},
	map[string]interface{}{},
}
var joinTable1 = []interface{}{
	map[string]interface{}{"id": 0, "name": "bob"},
	map[string]interface{}{"id": 1, "name": "tom"},
	map[string]interface{}{"id": 2, "name": "joe"},
}
var joinTable2 = []interface{}{
	map[string]interface{}{"id": 0, "title": "goof"},
	map[string]interface{}{"id": 2, "title": "lmoe"},
}
var joinTable3 = []interface{}{
	map[string]interface{}{"it": 0, "title": "goof"},
	map[string]interface{}{"it": 2, "title": "lmoe"},
}

type TStr string
type TMap map[string]interface{}

type T struct {
	A string `gorethink:"id, omitempty"`
	B int
	C int `gorethink:"-"`
	D map[string]interface{}
	E []interface{}
	F X
}

type SimpleT struct {
	A string
	B int
}

type X struct {
	XA int
	XB string
	XC []string
	XD Y
	XE TStr
	XF []TStr
}

type Y struct {
	YA int
	YB map[string]interface{}
	YC map[string]string
	YD TMap
}

type PseudoTypes struct {
	T time.Time
	B []byte
}

var str = T{
	A: "A",
	B: 1,
	C: 1,
	D: map[string]interface{}{
		"D1": 1,
		"D2": "2",
	},
	E: []interface{}{
		"E1", "E2", "E3", 4,
	},
	F: X{
		XA: 2,
		XB: "B",
		XC: []string{"XC1", "XC2"},
		XD: Y{
			YA: 3,
			YB: map[string]interface{}{
				"1": "1",
				"2": "2",
				"3": 3,
			},
			YC: map[string]string{
				"YC1": "YC1",
			},
			YD: TMap{
				"YD1": "YD1",
			},
		},
		XE: "XE",
		XF: []TStr{
			"XE1", "XE2",
		},
	},
}

func (s *RethinkSuite) BenchmarkExpr(c *test.C) {
	for i := 0; i < c.N; i++ {
		// Test query
		query := Expr(true)
		err := query.Exec(sess)
		c.Assert(err, test.IsNil)
	}
}

func (s *RethinkSuite) BenchmarkNoReplyExpr(c *test.C) {
	for i := 0; i < c.N; i++ {
		// Test query
		query := Expr(true)
		err := query.Exec(sess, RunOpts{NoReply: true})
		c.Assert(err, test.IsNil)
	}
}

func (s *RethinkSuite) BenchmarkGet(c *test.C) {
	// Ensure table + database exist
	DbCreate("test").RunWrite(sess)
	Db("test").TableCreate("TestMany").RunWrite(sess)
	Db("test").Table("TestMany").Delete().RunWrite(sess)

	// Insert rows
	data := []interface{}{}
	for i := 0; i < 100; i++ {
		data = append(data, map[string]interface{}{
			"id": i,
		})
	}
	Db("test").Table("TestMany").Insert(data).Run(sess)

	for i := 0; i < c.N; i++ {
		n := rand.Intn(100)

		// Test query
		var response interface{}
		query := Db("test").Table("TestMany").Get(n)
		res, err := query.Run(sess)
		c.Assert(err, test.IsNil)

		err = res.One(&response)

		c.Assert(err, test.IsNil)
		c.Assert(response, JsonEquals, map[string]interface{}{"id": n})
	}
}

func (s *RethinkSuite) BenchmarkGetStruct(c *test.C) {
	// Ensure table + database exist
	DbCreate("test").RunWrite(sess)
	Db("test").TableCreate("TestMany").RunWrite(sess)
	Db("test").Table("TestMany").Delete().RunWrite(sess)

	// Insert rows
	data := []interface{}{}
	for i := 0; i < 100; i++ {
		data = append(data, map[string]interface{}{
			"id":   i,
			"name": "Object 1",
			"Attrs": []interface{}{map[string]interface{}{
				"Name":  "attr 1",
				"Value": "value 1",
			}},
		})
	}
	Db("test").Table("TestMany").Insert(data).Run(sess)

	for i := 0; i < c.N; i++ {
		n := rand.Intn(100)

		// Test query
		var resObj object
		query := Db("test").Table("TestMany").Get(n)
		res, err := query.Run(sess)
		c.Assert(err, test.IsNil)

		err = res.One(&resObj)

		c.Assert(err, test.IsNil)
	}
}

func (s *RethinkSuite) BenchmarkSelectMany(c *test.C) {
	// Ensure table + database exist
	DbCreate("test").RunWrite(sess)
	Db("test").TableCreate("TestMany").RunWrite(sess)
	Db("test").Table("TestMany").Delete().RunWrite(sess)

	// Insert rows
	data := []interface{}{}
	for i := 0; i < 100; i++ {
		data = append(data, map[string]interface{}{
			"id": i,
		})
	}
	Db("test").Table("TestMany").Insert(data).Run(sess)

	for i := 0; i < c.N; i++ {
		// Test query
		res, err := Db("test").Table("TestMany").Run(sess)
		c.Assert(err, test.IsNil)

		var response []map[string]interface{}
		err = res.All(&response)

		c.Assert(err, test.IsNil)
		c.Assert(response, test.HasLen, 100)
	}
}

func (s *RethinkSuite) BenchmarkSelectManyStruct(c *test.C) {
	// Ensure table + database exist
	DbCreate("test").RunWrite(sess)
	Db("test").TableCreate("TestMany").RunWrite(sess)
	Db("test").Table("TestMany").Delete().RunWrite(sess)

	// Insert rows
	data := []interface{}{}
	for i := 0; i < 100; i++ {
		data = append(data, map[string]interface{}{
			"id":   i,
			"name": "Object 1",
			"Attrs": []interface{}{map[string]interface{}{
				"Name":  "attr 1",
				"Value": "value 1",
			}},
		})
	}
	Db("test").Table("TestMany").Insert(data).Run(sess)

	for i := 0; i < c.N; i++ {
		// Test query
		res, err := Db("test").Table("TestMany").Run(sess)
		c.Assert(err, test.IsNil)

		var response []object
		err = res.All(&response)

		c.Assert(err, test.IsNil)
		c.Assert(response, test.HasLen, 100)
	}
}

func doConcurrentTest(c *test.C, ct func()) {
	maxProcs, numReqs := 1, 150
	if testing.Short() {
		maxProcs, numReqs = 4, 50
	}
	defer runtime.GOMAXPROCS(runtime.GOMAXPROCS(maxProcs))

	var wg sync.WaitGroup
	wg.Add(numReqs)

	reqs := make(chan bool)
	defer close(reqs)

	for i := 0; i < maxProcs*2; i++ {
		go func() {
			for _ = range reqs {
				ct()
				if c.Failed() {
					wg.Done()
					continue
				}
				wg.Done()
			}
		}()
	}

	for i := 0; i < numReqs; i++ {
		reqs <- true
	}

	wg.Wait()
}
