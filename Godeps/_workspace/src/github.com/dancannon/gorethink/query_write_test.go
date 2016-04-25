package gorethink

import (
	test "gopkg.in/check.v1"
)

func (s *RethinkSuite) TestWriteInsert(c *test.C) {
	query := DB("test").Table("test").Insert(map[string]interface{}{"num": 1})
	_, err := query.Run(session)
	c.Assert(err, test.IsNil)
}

func (s *RethinkSuite) TestWriteInsertChanges(c *test.C) {
	query := DB("test").Table("test").Insert([]interface{}{
		map[string]interface{}{"num": 1},
		map[string]interface{}{"num": 2},
	}, InsertOpts{ReturnChanges: true})
	res, err := query.RunWrite(session)
	c.Assert(err, test.IsNil)
	c.Assert(res.Inserted, test.Equals, 2)
	c.Assert(len(res.Changes), test.Equals, 2)
}

func (s *RethinkSuite) TestWriteInsertStruct(c *test.C) {
	var response map[string]interface{}
	o := object{
		Name: "map[string]interface{}ect 3",
		Attrs: []attr{
			attr{
				Name:  "Attr 2",
				Value: "Value",
			},
		},
	}

	query := DB("test").Table("test").Insert(o)
	res, err := query.Run(session)
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response["inserted"], test.Equals, float64(1))
}

func (s *RethinkSuite) TestWriteInsertStructPointer(c *test.C) {
	var response map[string]interface{}
	o := object{
		Name: "map[string]interface{}ect 3",
		Attrs: []attr{
			attr{
				Name:  "Attr 2",
				Value: "Value",
			},
		},
	}

	query := DB("test").Table("test").Insert(&o)
	res, err := query.Run(session)
	c.Assert(err, test.IsNil)

	err = res.One(&response)

	c.Assert(err, test.IsNil)
	c.Assert(response["inserted"], test.Equals, float64(1))
}

func (s *RethinkSuite) TestWriteUpdate(c *test.C) {
	query := DB("test").Table("test").Insert(map[string]interface{}{"num": 1})
	_, err := query.Run(session)
	c.Assert(err, test.IsNil)

	// Update the first row in the table
	query = DB("test").Table("test").Sample(1).Update(map[string]interface{}{"num": 2})
	_, err = query.Run(session)
	c.Assert(err, test.IsNil)
}

func (s *RethinkSuite) TestWriteReplace(c *test.C) {
	query := DB("test").Table("test").Insert(map[string]interface{}{"num": 1})
	_, err := query.Run(session)
	c.Assert(err, test.IsNil)

	// Replace the first row in the table
	query = DB("test").Table("test").Sample(1).Update(map[string]interface{}{"num": 2})
	_, err = query.Run(session)
	c.Assert(err, test.IsNil)
}

func (s *RethinkSuite) TestWriteDelete(c *test.C) {
	query := DB("test").Table("test").Insert(map[string]interface{}{"num": 1})
	_, err := query.Run(session)
	c.Assert(err, test.IsNil)

	// Delete the first row in the table
	query = DB("test").Table("test").Sample(1).Delete()
	_, err = query.Run(session)
	c.Assert(err, test.IsNil)
}

func (s *RethinkSuite) TestWriteReference(c *test.C) {
	author := Author{
		ID:   "1",
		Name: "JRR Tolkien",
	}

	book := Book{
		ID:     "1",
		Title:  "The Lord of the Rings",
		Author: author,
	}

	DB("test").TableDrop("authors").Exec(session)
	DB("test").TableDrop("books").Exec(session)
	DB("test").TableCreate("authors").Exec(session)
	DB("test").TableCreate("books").Exec(session)

	_, err := DB("test").Table("authors").Insert(author).RunWrite(session)
	c.Assert(err, test.IsNil)

	_, err = DB("test").Table("books").Insert(book).RunWrite(session)
	c.Assert(err, test.IsNil)

	// Read back book + author and check result
	cursor, err := DB("test").Table("books").Get("1").Merge(func(p Term) interface{} {
		return map[string]interface{}{
			"author_id": DB("test").Table("authors").Get(p.Field("author_id")),
		}
	}).Run(session)
	c.Assert(err, test.IsNil)

	var out Book
	err = cursor.One(&out)
	c.Assert(err, test.IsNil)

	c.Assert(out.Title, test.Equals, "The Lord of the Rings")
	c.Assert(out.Author.Name, test.Equals, "JRR Tolkien")
}

func (s *RethinkSuite) TestWriteConflict(c *test.C) {
	query := DB("test").Table("test").Insert(map[string]interface{}{"id": "a"})
	_, err := query.RunWrite(session)
	c.Assert(err, test.IsNil)

	query = DB("test").Table("test").Insert(map[string]interface{}{"id": "a"})
	_, err = query.RunWrite(session)
	c.Assert(IsConflictErr(err), test.Equals, true)
}
