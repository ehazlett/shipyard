package gorethink

import test "gopkg.in/check.v1"

func (s *RethinkSuite) TestQueryRun(c *test.C) {
	var response string

	res, err := Expr("Test").Run(session)
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, "Test")
}

func (s *RethinkSuite) TestQueryReadOne(c *test.C) {
	var response string

	err := Expr("Test").ReadOne(&response, session)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, "Test")
}

func (s *RethinkSuite) TestQueryReadAll(c *test.C) {
	var response []int

	err := Expr([]int{1, 2, 3}).ReadAll(&response, session)
	c.Assert(err, test.IsNil)
	c.Assert(response, test.HasLen, 3)
	c.Assert(response, test.DeepEquals, []int{1, 2, 3})
}

func (s *RethinkSuite) TestQueryExec(c *test.C) {
	err := Expr("Test").Exec(session)
	c.Assert(err, test.IsNil)
}

func (s *RethinkSuite) TestQueryProfile(c *test.C) {
	var response string

	res, err := Expr("Test").Run(session, RunOpts{
		Profile: true,
	})
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(res.Profile(), test.NotNil)
	c.Assert(response, test.Equals, "Test")
}

func (s *RethinkSuite) TestQueryRunRawTime(c *test.C) {
	var response map[string]interface{}

	res, err := Now().Run(session, RunOpts{
		TimeFormat: "raw",
	})
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response["$reql_type$"], test.NotNil)
	c.Assert(response["$reql_type$"], test.Equals, "TIME")
}

func (s *RethinkSuite) TestQueryRunNil(c *test.C) {
	res, err := Expr("Test").Run(nil)
	c.Assert(res, test.IsNil)
	c.Assert(err, test.NotNil)
	c.Assert(err, test.Equals, ErrConnectionClosed)
}

func (s *RethinkSuite) TestQueryRunNotConnected(c *test.C) {
	res, err := Expr("Test").Run(&Session{})
	c.Assert(res, test.IsNil)
	c.Assert(err, test.NotNil)
	c.Assert(err, test.Equals, ErrConnectionClosed)
}
