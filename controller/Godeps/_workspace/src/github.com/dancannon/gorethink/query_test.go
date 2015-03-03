package gorethink

import test "gopkg.in/check.v1"

func (s *RethinkSuite) TestQueryRun(c *test.C) {
	var response string

	res, err := Expr("Test").Run(sess)
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, "Test")
}

func (s *RethinkSuite) TestQueryProfile(c *test.C) {
	var response string

	res, err := Expr("Test").Run(sess, RunOpts{
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

	res, err := Now().Run(sess, RunOpts{
		TimeFormat: "raw",
	})
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response["$reql_type$"], test.NotNil)
	c.Assert(response["$reql_type$"], test.Equals, "TIME")
}
