package gorethink

import (
	p "github.com/dancannon/gorethink/ql2"
)

type TableCreateOpts struct {
	PrimaryKey interface{} `gorethink:"primary_key,omitempty"`
	Durability interface{} `gorethink:"durability,omitempty"`
	CacheSize  interface{} `gorethink:"cache_size,omitempty"`
	DataCenter interface{} `gorethink:"datacenter,omitempty"`
}

func (o *TableCreateOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Create a table. A RethinkDB table is a collection of JSON documents.
//
// If successful, the operation returns an object: {created: 1}. If a table with
// the same name already exists, the operation throws RqlRuntimeError.
//
// Note: that you can only use alphanumeric characters and underscores for the
// table name.
//
// r.Db("database").TableCreate("table", "durability", "soft").Run(sess)
func (t Term) TableCreate(name interface{}, optArgs ...TableCreateOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "TableCreate", p.Term_TABLE_CREATE, []interface{}{name}, opts)
}

// Drop a table. The table and all its data will be deleted.
//
// If successful, the operation returns an object: {dropped: 1}. If the specified
// table doesn't exist a RqlRuntimeError is thrown.
func (t Term) TableDrop(args ...interface{}) Term {
	return constructMethodTerm(t, "TableDrop", p.Term_TABLE_DROP, args, map[string]interface{}{})
}

// List all table names in a database.
func (t Term) TableList(args ...interface{}) Term {
	return constructMethodTerm(t, "TableList", p.Term_TABLE_LIST, args, map[string]interface{}{})
}

type IndexCreateOpts struct {
	Multi interface{} `gorethink:"multi,omitempty"`
	Geo   interface{} `gorethink:"geo,omitempty"`
}

func (o *IndexCreateOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Create a new secondary index on this table.
//
// A multi index can be created by passing an optional multi argument. Multi indexes
//  functions should return arrays and allow you to query based on whether a value
//  is present in the returned array. The example would allow us to get heroes who
//  possess a specific ability (the field 'abilities' is an array).
func (t Term) IndexCreate(name interface{}, optArgs ...IndexCreateOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "IndexCreate", p.Term_INDEX_CREATE, []interface{}{name}, opts)
}

// Create a new secondary index on this table based on the value of the function
// passed.
//
// A compound index can be created by returning an array of values to use as the secondary index key.
func (t Term) IndexCreateFunc(name, f interface{}, optArgs ...IndexCreateOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "IndexCreate", p.Term_INDEX_CREATE, []interface{}{name, funcWrap(f)}, opts)
}

// Delete a previously created secondary index of this table.
func (t Term) IndexDrop(args ...interface{}) Term {
	return constructMethodTerm(t, "IndexDrop", p.Term_INDEX_DROP, args, map[string]interface{}{})
}

// List all the secondary indexes of this table.
func (t Term) IndexList(args ...interface{}) Term {
	return constructMethodTerm(t, "IndexList", p.Term_INDEX_LIST, args, map[string]interface{}{})
}

type IndexRenameOpts struct {
	Overwrite interface{} `gorethink:"overwrite,omitempty"`
}

func (o *IndexRenameOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// IndexRename renames an existing secondary index on a table. If the optional
// argument overwrite is specified as True, a previously existing index with the
// new name will be deleted and the index will be renamed. If overwrite is False
// (the default) an error will be raised if the new index name already exists.
func (t Term) IndexRename(oldName, newName interface{}, optArgs ...IndexRenameOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "IndexRename", p.Term_INDEX_RENAME, []interface{}{oldName, newName}, opts)
}

// Get the status of the specified indexes on this table, or the status of all
// indexes on this table if no indexes are specified.
func (t Term) IndexStatus(args ...interface{}) Term {
	return constructMethodTerm(t, "IndexStatus", p.Term_INDEX_STATUS, args, map[string]interface{}{})
}

// Wait for the specified indexes on this table to be ready, or for all indexes
// on this table to be ready if no indexes are specified.
func (t Term) IndexWait(args ...interface{}) Term {
	return constructMethodTerm(t, "IndexWait", p.Term_INDEX_WAIT, args, map[string]interface{}{})
}

// Takes a table and returns an infinite stream of objects representing changes to that table.
// Whenever an insert, delete, update or replace is performed on the table, an object of the form
// {old_val:..., new_val:...} will be added to the stream. For an insert, old_val will be
// null, and for a delete, new_val will be null.
func (t Term) Changes() Term {
	return constructMethodTerm(t, "Changes", p.Term_CHANGES, []interface{}{}, map[string]interface{}{})
}
