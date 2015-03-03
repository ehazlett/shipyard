package gorethink

import (
	test "gopkg.in/check.v1"
)

func (s *RethinkSuite) TestDbCreate(c *test.C) {
	var response interface{}

	// Delete the test2 database if it already exists
	DbDrop("test").Exec(sess)

	// Test database creation
	query := DbCreate("test")

	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, map[string]interface{}{"created": 1})
}

func (s *RethinkSuite) TestDbList(c *test.C) {
	var response []interface{}

	// create database
	DbCreate("test").Exec(sess)

	// Try and find it in the list
	success := false
	res, err := DbList().Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, test.FitsTypeOf, []interface{}{})

	for _, db := range response {
		if db == "test" {
			success = true
		}
	}

	c.Assert(success, test.Equals, true)
}

func (s *RethinkSuite) TestDbDelete(c *test.C) {
	var response interface{}

	// Delete the test2 database if it already exists
	DbCreate("test").Exec(sess)

	// Test database creation
	query := DbDrop("test")

	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, map[string]interface{}{"dropped": 1})

	// Ensure that there is still a test DB after the test has finished
	DbCreate("test").Exec(sess)
}
