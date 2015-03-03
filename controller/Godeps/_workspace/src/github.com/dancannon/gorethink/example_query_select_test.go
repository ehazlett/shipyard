package gorethink_test

import (
	"fmt"
	"log"

	r "github.com/dancannon/gorethink"
)

func Example_Get() {
	type Person struct {
		Id        string `gorethink:"id, omitempty"`
		FirstName string `gorethink:"first_name"`
		LastName  string `gorethink:"last_name"`
		Gender    string `gorethink:"gender"`
	}

	sess, err := r.Connect(r.ConnectOpts{
		Address: url,
		AuthKey: authKey,
	})
	if err != nil {
		log.Fatalf("Error connecting to DB: %s", err)
	}

	// Setup table
	r.Db("test").TableDrop("table").Run(sess)
	r.Db("test").TableCreate("table").Run(sess)
	r.Db("test").Table("table").Insert(Person{"1", "John", "Smith", "M"}).Run(sess)

	// Fetch the row from the database
	res, err := r.Db("test").Table("table").Get("1").Run(sess)
	if err != nil {
		log.Fatalf("Error finding person: %s", err)
	}

	if res.IsNil() {
		log.Fatalf("Person not found")
	}

	// Scan query result into the person variable
	var person Person
	err = res.One(&person)
	if err != nil {
		log.Fatalf("Error scanning database result: %s", err)
	}
	fmt.Printf("%s %s (%s)", person.FirstName, person.LastName, person.Gender)

	// Output:
	// John Smith (M)
}

func Example_GetAll_Compound() {
	type Person struct {
		Id        string `gorethink:"id, omitempty"`
		FirstName string `gorethink:"first_name"`
		LastName  string `gorethink:"last_name"`
		Gender    string `gorethink:"gender"`
	}

	sess, err := r.Connect(r.ConnectOpts{
		Address: url,
		AuthKey: authKey,
	})
	if err != nil {
		log.Fatalf("Error connecting to DB: %s", err)
	}

	// Setup table
	r.Db("test").TableDrop("table").Run(sess)
	r.Db("test").TableCreate("table").Run(sess)
	r.Db("test").Table("table").Insert(Person{"1", "John", "Smith", "M"}).Run(sess)
	r.Db("test").Table("table").IndexCreateFunc("full_name", func(row r.Term) interface{} {
		return []interface{}{row.Field("first_name"), row.Field("last_name")}
	}).Run(sess)
	r.Db("test").Table("table").IndexWait().Run(sess)

	// Fetch the row from the database
	res, err := r.Db("test").Table("table").GetAllByIndex("full_name", []interface{}{"John", "Smith"}).Run(sess)
	if err != nil {
		log.Fatalf("Error finding person: %s", err)
	}

	if res.IsNil() {
		log.Fatalf("Person not found")
	}

	// Scan query result into the person variable
	var person Person
	err = res.One(&person)
	if err == r.ErrEmptyResult {
		log.Fatalf("Person not found")
	} else if err != nil {
		log.Fatalf("Error scanning database result: %s", err)
	}

	fmt.Printf("%s %s (%s)", person.FirstName, person.LastName, person.Gender)

	// Output:
	// John Smith (M)
}
