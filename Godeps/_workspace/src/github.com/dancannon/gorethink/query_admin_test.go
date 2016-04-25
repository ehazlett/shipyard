package gorethink

import (
	test "gopkg.in/check.v1"
)

func (s *RethinkSuite) TestAdminDbConfig(c *test.C) {
	DB("test").TableDrop("test").Exec(session)
	DB("test").TableCreate("test").Exec(session)

	// Test index rename
	query := DB("test").Table("test").Config()

	res, err := query.Run(session)
	c.Assert(err, test.IsNil)

	var response map[string]interface{}
	err = res.One(&response)
	c.Assert(err, test.IsNil)

	c.Assert(response["name"], test.Equals, "test")
}

func (s *RethinkSuite) TestAdminTableConfig(c *test.C) {
	DB("test").TableDrop("test").Exec(session)
	DB("test").TableCreate("test").Exec(session)

	// Test index rename
	query := DB("test").Config()

	res, err := query.Run(session)
	c.Assert(err, test.IsNil)

	var response map[string]interface{}
	err = res.One(&response)
	c.Assert(err, test.IsNil)

	c.Assert(response["name"], test.Equals, "test")
}

func (s *RethinkSuite) TestAdminTableStatus(c *test.C) {
	DB("test").TableDrop("test").Exec(session)
	DB("test").TableCreate("test").Exec(session)

	// Test index rename
	query := DB("test").Table("test").Status()

	res, err := query.Run(session)
	c.Assert(err, test.IsNil)

	var response map[string]interface{}
	err = res.One(&response)
	c.Assert(err, test.IsNil)

	c.Assert(response["name"], test.Equals, "test")
	c.Assert(response["status"], test.NotNil)
}

func (s *RethinkSuite) TestAdminWaitOpts(c *test.C) {
	DB("test").TableDrop("test").Exec(session)
	DB("test").TableCreate("test").Exec(session)

	query := DB("test").Table("test").Wait(WaitOpts{
		WaitFor: "all_replicas_ready",
		Timeout: 10,
	})

	res, err := query.Run(session)
	c.Assert(err, test.IsNil)

	var response map[string]interface{}
	err = res.One(&response)
	c.Assert(err, test.IsNil)

	c.Assert(response["ready"].(float64) > 0, test.Equals, true)
}

func (s *RethinkSuite) TestAdminStatus(c *test.C) {
	DB("test").TableDrop("test").Exec(session)
	DB("test").TableCreate("test").Exec(session)

	// Test index rename
	query := DB("test").Table("test").Wait()

	res, err := query.Run(session)
	c.Assert(err, test.IsNil)

	var response map[string]interface{}
	err = res.One(&response)
	c.Assert(err, test.IsNil)

	c.Assert(response["ready"], test.Equals, float64(1))
}

func (s *RethinkSuite) TestAdminGrantDatabase(c *test.C) {
	DB("rethinkdb").Table("users").Insert(map[string]string{
		"id":       "test_user",
		"password": "password",
	}).Exec(session)

	DB("test").TableDrop("test_grant").Exec(session)
	DB("test").TableCreate("test_grant").Exec(session)

	err := DB("test").Table("test_grant").Grant("test_user", map[string]bool{
		"read": true, "write": true, "config": true,
	}).Exec(session)
	c.Assert(err, test.IsNil)
}
