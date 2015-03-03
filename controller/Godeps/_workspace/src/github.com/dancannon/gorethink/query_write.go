package gorethink

import (
	p "github.com/dancannon/gorethink/ql2"
)

type InsertOpts struct {
	Durability    interface{} `gorethink:"durability,omitempty"`
	ReturnChanges interface{} `gorethink:"return_changes,omitempty"`
	CacheSize     interface{} `gorethink:"cache_size,omitempty"`
	Conflict      interface{} `gorethink:"conflict,omitempty"`
}

func (o *InsertOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Insert JSON documents into a table. Accepts a single JSON document or an array
// of documents. You may also pass the optional argument durability with value
// 'hard' or 'soft', to override the table or query's default durability setting,
// or the optional argument return_changes, which will return the value of the row
// you're inserting when set to true.
//
//	table.Insert(map[string]interface{}{"name": "Joe", "email": "joe@example.com"}).RunWrite(sess)
//	table.Insert([]interface{}{map[string]interface{}{"name": "Joe"}, map[string]interface{}{"name": "Paul"}}).RunWrite(sess)
func (t Term) Insert(arg interface{}, optArgs ...InsertOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Insert", p.Term_INSERT, []interface{}{Expr(arg)}, opts)
}

type UpdateOpts struct {
	Durability    interface{} `gorethink:"durability,omitempty"`
	ReturnChanges interface{} `gorethink:"return_changes,omitempty"`
	NotAtomic     interface{} `gorethink:"non_atomic,omitempty"`
}

func (o *UpdateOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Update JSON documents in a table. Accepts a JSON document, a RQL expression,
// or a combination of the two. The optional argument durability with value
// 'hard' or 'soft' will override the table or query's default durability setting.
// The optional argument return_changes will return the old and new values of the
// row you're modifying when set to true (only valid for single-row updates).
// The optional argument non_atomic lets you permit non-atomic updates.
func (t Term) Update(arg interface{}, optArgs ...UpdateOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Update", p.Term_UPDATE, []interface{}{funcWrap(arg)}, opts)
}

type ReplaceOpts struct {
	Durability    interface{} `gorethink:"durability,omitempty"`
	ReturnChanges interface{} `gorethink:"return_changes,omitempty"`
	NotAtomic     interface{} `gorethink:"non_atomic,omitempty"`
}

func (o *ReplaceOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Replace documents in a table. Accepts a JSON document or a RQL expression,
// and replaces the original document with the new one. The new document must
// have the same primary key as the original document. The optional argument
// durability with value 'hard' or 'soft' will override the table or query's
// default durability setting. The optional argument return_changes will return
// the old and new values of the row you're modifying when set to true (only
// valid for single-row replacements). The optional argument non_atomic lets
// you permit non-atomic updates.
func (t Term) Replace(arg interface{}, optArgs ...ReplaceOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Replace", p.Term_REPLACE, []interface{}{funcWrap(arg)}, opts)
}

type DeleteOpts struct {
	Durability    interface{} `gorethink:"durability,omitempty"`
	ReturnChanges interface{} `gorethink:"return_changes,omitempty"`
}

func (o *DeleteOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Delete one or more documents from a table. The optional argument return_changes
// will return the old value of the row you're deleting when set to true (only
// valid for single-row deletes). The optional argument durability with value
// 'hard' or 'soft' will override the table or query's default durability setting.
func (t Term) Delete(optArgs ...DeleteOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructMethodTerm(t, "Delete", p.Term_DELETE, []interface{}{}, opts)
}

// Sync ensures that writes on a given table are written to permanent storage.
// Queries that specify soft durability (Durability: "soft") do not give such
// guarantees, so sync can be used to ensure the state of these queries. A call
// to sync does not return until all previous writes to the table are persisted.
func (t Term) Sync(args ...interface{}) Term {
	return constructMethodTerm(t, "Sync", p.Term_SYNC, args, map[string]interface{}{})
}
