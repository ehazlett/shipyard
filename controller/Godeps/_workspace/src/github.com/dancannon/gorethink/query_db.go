package gorethink

import (
	p "github.com/dancannon/gorethink/ql2"
)

// Create a database. A RethinkDB database is a collection of tables, similar to
// relational databases.
//
// If successful, the operation returns an object: {created: 1}. If a database
// with the same name already exists the operation throws RqlRuntimeError.
//
// Note: that you can only use alphanumeric characters and underscores for the database name.
func DbCreate(args ...interface{}) Term {
	return constructRootTerm("DbCreate", p.Term_DB_CREATE, args, map[string]interface{}{})
}

// Drop a database. The database, all its tables, and corresponding data will be
// deleted.
//
// If successful, the operation returns the object {dropped: 1}. If the specified
// database doesn't exist a RqlRuntimeError is thrown.
func DbDrop(args ...interface{}) Term {
	return constructRootTerm("DbDrop", p.Term_DB_DROP, args, map[string]interface{}{})
}

// List all database names in the system.
func DbList(args ...interface{}) Term {
	return constructRootTerm("DbList", p.Term_DB_LIST, args, map[string]interface{}{})
}
