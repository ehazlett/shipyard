package gorethink

import (
	test "gopkg.in/check.v1"
)

func (s *RethinkSuite) TestTransformationMapImplicit(c *test.C) {
	query := Expr(arr).Map(Row.Add(1))

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{2, 3, 4, 5, 6, 7, 8, 9, 10})
}

func (s *RethinkSuite) TestTransformationMapFunc(c *test.C) {
	query := Expr(arr).Map(func(row Term) Term {
		return row.Add(1)
	})

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{2, 3, 4, 5, 6, 7, 8, 9, 10})
}

func (s *RethinkSuite) TestTransformationWithFields(c *test.C) {
	query := Expr(objList).WithFields("id", "num").OrderBy("id")

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{
		map[string]interface{}{"num": 0, "id": 1},
		map[string]interface{}{"num": 5, "id": 2},
		map[string]interface{}{"num": 10, "id": 3},
		map[string]interface{}{"num": 0, "id": 4},
		map[string]interface{}{"num": 100, "id": 5},
		map[string]interface{}{"num": 15, "id": 6},
		map[string]interface{}{"num": 0, "id": 7},
		map[string]interface{}{"num": 50, "id": 8},
		map[string]interface{}{"num": 25, "id": 9},
	})
}

func (s *RethinkSuite) TestTransformationConcatMap(c *test.C) {
	query := Expr(objList).ConcatMap(func(row Term) Term {
		return Expr([]interface{}{row.Field("num")})
	})

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{0, 5, 10, 0, 100, 15, 0, 50, 25})
}

func (s *RethinkSuite) TestTransformationOrderByDesc(c *test.C) {
	query := Expr(noDupNumObjList).OrderBy(Desc("num"))

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{
		map[string]interface{}{"num": 100, "id": 5, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 50, "id": 8, "g2": 2, "g1": 4},
		map[string]interface{}{"num": 25, "id": 9, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 15, "id": 6, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 10, "id": 3, "g2": 2, "g1": 3},
		map[string]interface{}{"num": 5, "id": 2, "g2": 2, "g1": 2},
		map[string]interface{}{"num": 0, "id": 1, "g2": 1, "g1": 1},
	})
}

func (s *RethinkSuite) TestTransformationOrderByAsc(c *test.C) {
	query := Expr(noDupNumObjList).OrderBy(Asc("num"))

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{
		map[string]interface{}{"num": 0, "id": 1, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 5, "id": 2, "g2": 2, "g1": 2},
		map[string]interface{}{"num": 10, "id": 3, "g2": 2, "g1": 3},
		map[string]interface{}{"num": 15, "id": 6, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 25, "id": 9, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 50, "id": 8, "g2": 2, "g1": 4},
		map[string]interface{}{"num": 100, "id": 5, "g2": 3, "g1": 2},
	})
}

func (s *RethinkSuite) TestTransformationOrderByIndex(c *test.C) {
	Db("test").TableCreate("OrderByIndex").Exec(sess)
	Db("test").Table("test").IndexDrop("OrderByIndex").Exec(sess)

	// Test database creation
	Db("test").Table("OrderByIndex").IndexCreateFunc("test", Row.Field("num")).Exec(sess)
	Db("test").Table("OrderByIndex").Insert(noDupNumObjList).Exec(sess)

	query := Db("test").Table("OrderByIndex").OrderBy(OrderByOpts{
		Index: "test",
	})

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{
		map[string]interface{}{"num": 0, "id": 1, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 5, "id": 2, "g2": 2, "g1": 2},
		map[string]interface{}{"num": 10, "id": 3, "g2": 2, "g1": 3},
		map[string]interface{}{"num": 15, "id": 6, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 25, "id": 9, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 50, "id": 8, "g2": 2, "g1": 4},
		map[string]interface{}{"num": 100, "id": 5, "g2": 3, "g1": 2},
	})
}

func (s *RethinkSuite) TestTransformationOrderByIndexAsc(c *test.C) {
	Db("test").TableCreate("OrderByIndex").Exec(sess)
	Db("test").Table("test").IndexDrop("OrderByIndex").Exec(sess)

	// Test database creation
	Db("test").Table("OrderByIndex").IndexCreateFunc("test", Row.Field("num")).Exec(sess)
	Db("test").Table("OrderByIndex").Insert(noDupNumObjList).Exec(sess)

	query := Db("test").Table("OrderByIndex").OrderBy(OrderByOpts{
		Index: Asc("test"),
	})

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{
		map[string]interface{}{"num": 0, "id": 1, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 5, "id": 2, "g2": 2, "g1": 2},
		map[string]interface{}{"num": 10, "id": 3, "g2": 2, "g1": 3},
		map[string]interface{}{"num": 15, "id": 6, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 25, "id": 9, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 50, "id": 8, "g2": 2, "g1": 4},
		map[string]interface{}{"num": 100, "id": 5, "g2": 3, "g1": 2},
	})
}

func (s *RethinkSuite) TestTransformationOrderByMultiple(c *test.C) {
	query := Expr(objList).OrderBy(Desc("num"), Asc("id"))

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{
		map[string]interface{}{"num": 100, "id": 5, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 50, "id": 8, "g2": 2, "g1": 4},
		map[string]interface{}{"num": 25, "id": 9, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 15, "id": 6, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 10, "id": 3, "g2": 2, "g1": 3},
		map[string]interface{}{"num": 5, "id": 2, "g2": 2, "g1": 2},
		map[string]interface{}{"num": 0, "id": 1, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 0, "id": 4, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 0, "id": 7, "g2": 2, "g1": 1},
	})
}

func (s *RethinkSuite) TestTransformationOrderByFunc(c *test.C) {
	query := Expr(objList).OrderBy(func(row Term) Term {
		return row.Field("num").Add(row.Field("id"))
	})

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{
		map[string]interface{}{"num": 0, "id": 1, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 0, "id": 4, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 5, "id": 2, "g2": 2, "g1": 2},
		map[string]interface{}{"num": 0, "id": 7, "g2": 2, "g1": 1},
		map[string]interface{}{"num": 10, "id": 3, "g2": 2, "g1": 3},
		map[string]interface{}{"num": 15, "id": 6, "g2": 1, "g1": 1},
		map[string]interface{}{"num": 25, "id": 9, "g2": 3, "g1": 2},
		map[string]interface{}{"num": 50, "id": 8, "g2": 2, "g1": 4},
		map[string]interface{}{"num": 100, "id": 5, "g2": 3, "g1": 2},
	})
}

func (s *RethinkSuite) TestTransformationSkip(c *test.C) {
	query := Expr(arr).Skip(7)

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{8, 9})
}

func (s *RethinkSuite) TestTransformationLimit(c *test.C) {
	query := Expr(arr).Limit(2)

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{1, 2})
}

func (s *RethinkSuite) TestTransformationSlice(c *test.C) {
	query := Expr(arr).Slice(4)

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{5, 6, 7, 8, 9})
}

func (s *RethinkSuite) TestTransformationSliceRight(c *test.C) {
	query := Expr(arr).Slice(5, 6)

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{6})
}

func (s *RethinkSuite) TestTransformationSliceOpts(c *test.C) {
	query := Expr(arr).Slice(4, SliceOpts{LeftBound: "open"})

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{6, 7, 8, 9})
}

func (s *RethinkSuite) TestTransformationSliceRightOpts(c *test.C) {
	query := Expr(arr).Slice(5, 6, SliceOpts{RightBound: "closed"})

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{6, 7})
}

func (s *RethinkSuite) TestTransformationNth(c *test.C) {
	query := Expr(arr).Nth(2)

	var response interface{}
	r, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = r.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, 3)
}

func (s *RethinkSuite) TestTransformationAtIndexNth(c *test.C) {
	query := Expr([]interface{}{1}).AtIndex(Expr(0))

	var response interface{}
	r, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = r.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, 1)
}

func (s *RethinkSuite) TestTransformationAtIndexField(c *test.C) {
	query := Expr(map[string]interface{}{"foo": 1}).AtIndex(Expr("foo"))

	var response interface{}
	r, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = r.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, 1)
}

func (s *RethinkSuite) TestTransformationAtIndexArrayField(c *test.C) {
	query := Expr([]interface{}{1}).AtIndex(Expr("foo"))

	_, err := query.Run(sess)
	c.Assert(err, test.NotNil)
}

func (s *RethinkSuite) TestTransformationIndexesOf(c *test.C) {
	query := Expr(arr).IndexesOf(2)

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{1})
}

func (s *RethinkSuite) TestTransformationIsEmpty(c *test.C) {
	query := Expr([]interface{}{}).IsEmpty()

	var response bool
	r, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = r.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, test.Equals, true)
}

func (s *RethinkSuite) TestTransformationUnion(c *test.C) {
	query := Expr(arr).Union(arr)

	var response []interface{}
	res, err := query.Run(sess)
	c.Assert(err, test.IsNil)

	err = res.All(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response, JsonEquals, []interface{}{1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9})
}
