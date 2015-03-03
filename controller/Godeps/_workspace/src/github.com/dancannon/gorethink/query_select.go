package gorethink

import (
	p "github.com/dancannon/gorethink/ql2"
)

// Reference a database.
func Db(args ...interface{}) Term {
	return constructRootTerm("Db", p.Term_DB, args, map[string]interface{}{})
}

type TableOpts struct {
	UseOutdated interface{} `gorethink:"use_outdated,omitempty"`
}

func (o *TableOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Select all documents in a table. This command can be chained with other
// commands to do further processing on the data.
//
// Optional arguments (see http://www.rethinkdb.com/api/#js:selecting_data-table for more information):
// "use_outdated" (boolean - defaults to false)
func Table(name interface{}, optArgs ...TableOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructRootTerm("Table", p.Term_TABLE, []interface{}{name}, opts)
}

// Select all documents in a table. This command can be chained with other
// commands to do further processing on the data.
//
// Optional arguments (see http://www.rethinkdb.com/api/#js:selecting_data-table for more information):
// "use_outdated" (boolean - defaults to false)
func (t Term) Table(name interface{}, optArgs ...TableOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Table", p.Term_TABLE, []interface{}{name}, opts)
}

// Get a document by primary key. If nothing was found, RethinkDB will return a nil value.
func (t Term) Get(args ...interface{}) Term {
	return constructMethodTerm(t, "Get", p.Term_GET, args, map[string]interface{}{})
}

// Get all documents where the given value matches the value of the primary index.
func (t Term) GetAll(keys ...interface{}) Term {
	return constructMethodTerm(t, "GetAll", p.Term_GET_ALL, keys, map[string]interface{}{})
}

// Get all documents where the given value matches the value of the requested index.
func (t Term) GetAllByIndex(index interface{}, keys ...interface{}) Term {
	return constructMethodTerm(t, "GetAll", p.Term_GET_ALL, keys, map[string]interface{}{"index": index})
}

type BetweenOpts struct {
	Index      interface{} `gorethink:"index,omitempty"`
	LeftBound  interface{} `gorethink:"left_bound,omitempty"`
	RightBound interface{} `gorethink:"right_bound,omitempty"`
}

func (o *BetweenOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Get all documents between two keys. Accepts three optional arguments: `index`,
// `left_bound`, and `right_bound`. If `index` is set to the name of a secondary
// index, `between` will return all documents where that index's value is in the
// specified range (it uses the primary key by default). `left_bound` or
// `right_bound` may be set to `open` or `closed` to indicate whether or not to
// include that endpoint of the range (by default, `left_bound` is closed and
// `right_bound` is open).
func (t Term) Between(lowerKey, upperKey interface{}, optArgs ...BetweenOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Between", p.Term_BETWEEN, []interface{}{lowerKey, upperKey}, opts)
}

type FilterOpts struct {
	Default interface{} `gorethink:"default,omitempty"`
}

func (o *FilterOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Get all the documents for which the given predicate is true.
//
// Filter can be called on a sequence, selection, or a field containing an array
// of elements. The return type is the same as the type on which the function was
// called on. The body of every filter is wrapped in an implicit `.default(false)`,
// and the default value can be changed by passing the optional argument `default`.
// Setting this optional argument to `r.error()` will cause any non-existence
// errors to abort the filter.
func (t Term) Filter(f interface{}, optArgs ...FilterOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Filter", p.Term_FILTER, []interface{}{funcWrap(f)}, opts)
}
