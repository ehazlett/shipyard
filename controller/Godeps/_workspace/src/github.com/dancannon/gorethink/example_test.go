package gorethink_test

import (
	"fmt"
	"log"
	"os"

	r "github.com/dancannon/gorethink"
)

var session *r.Session
var url, authKey string

func init() {
	// Needed for wercker. By default url is "localhost:28015"
	url = os.Getenv("RETHINKDB_URL")
	if url == "" {
		url = "localhost:28015"
	}

	// Needed for running tests for RethinkDB with a non-empty authkey
	authKey = os.Getenv("RETHINKDB_AUTHKEY")
}

func Example() {
	session, err := r.Connect(r.ConnectOpts{
		Address: url,
		AuthKey: authKey,
	})
	if err != nil {
		log.Fatalf("Error connecting to DB: %s", err)
	}

	res, err := r.Expr("Hello World").Run(session)
	if err != nil {
		log.Fatalln(err.Error())
	}

	var response string
	err = res.One(&response)
	if err != nil {
		log.Fatalln(err.Error())
	}

	fmt.Println(response)
}
