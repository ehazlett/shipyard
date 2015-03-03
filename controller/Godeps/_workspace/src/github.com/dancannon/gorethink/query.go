package gorethink

import (
	"fmt"
	"strconv"
	"strings"

	p "github.com/dancannon/gorethink/ql2"
)

type OptArgs interface {
	toMap() map[string]interface{}
}
type termsList []Term
type termsObj map[string]Term
type Term struct {
	name     string
	rootTerm bool
	termType p.Term_TermType
	data     interface{}
	args     []Term
	optArgs  map[string]Term
}

// build takes the query tree and prepares it to be sent as a JSON
// expression
func (t Term) build() interface{} {
	switch t.termType {
	case p.Term_DATUM:
		return t.data
	case p.Term_MAKE_OBJ:
		res := map[string]interface{}{}
		for k, v := range t.optArgs {
			res[k] = v.build()
		}
		return res
	case p.Term_BINARY:
		if len(t.args) == 0 {
			return map[string]interface{}{
				"$reql_type$": "BINARY",
				"data":        t.data,
			}
		}
	}

	args := []interface{}{}
	optArgs := map[string]interface{}{}

	for _, v := range t.args {
		args = append(args, v.build())
	}

	for k, v := range t.optArgs {
		optArgs[k] = v.build()
	}

	return []interface{}{t.termType, args, optArgs}
}

// String returns a string representation of the query tree
func (t Term) String() string {
	switch t.termType {
	case p.Term_MAKE_ARRAY:
		return fmt.Sprintf("[%s]", strings.Join(argsToStringSlice(t.args), ", "))
	case p.Term_MAKE_OBJ:
		return fmt.Sprintf("{%s}", strings.Join(optArgsToStringSlice(t.optArgs), ", "))
	case p.Term_FUNC:
		// Get string representation of each argument
		args := []string{}
		for _, v := range t.args[0].args {
			args = append(args, fmt.Sprintf("var_%d", v.data))
		}

		return fmt.Sprintf("func(%s r.Term) r.Term { return %s }",
			strings.Join(args, ", "),
			t.args[1].String(),
		)
	case p.Term_VAR:
		return fmt.Sprintf("var_%s", t.args[0])
	case p.Term_IMPLICIT_VAR:
		return "r.Row"
	case p.Term_DATUM:
		switch v := t.data.(type) {
		case string:
			return strconv.Quote(v)
		default:
			return fmt.Sprintf("%v", v)
		}
	case p.Term_BINARY:
		if len(t.args) == 0 {
			return fmt.Sprintf("r.binary(<data>)")
		}
	}

	if t.rootTerm {
		return fmt.Sprintf("r.%s(%s)", t.name, strings.Join(allArgsToStringSlice(t.args, t.optArgs), ", "))
	}
	return fmt.Sprintf("%s.%s(%s)", t.args[0].String(), t.name, strings.Join(allArgsToStringSlice(t.args[1:], t.optArgs), ", "))
}

type WriteResponse struct {
	Errors        int
	Created       int
	Inserted      int
	Updated       int
	Unchanged     int
	Replaced      int
	Renamed       int
	Deleted       int
	GeneratedKeys []string `gorethink:"generated_keys"`
	FirstError    string   `gorethink:"first_error"` // populated if Errors > 0
	Changes       []WriteChanges
}

type WriteChanges struct {
	NewValue interface{} `gorethink:"new_val"`
	OldValue interface{} `gorethink:"old_val"`
}

type RunOpts struct {
	Db             interface{} `gorethink:"db,omitempty"`
	Profile        interface{} `gorethink:"profile,omitempty"`
	UseOutdated    interface{} `gorethink:"use_outdated,omitempty"`
	NoReply        interface{} `gorethink:"noreply,omitempty"`
	ArrayLimit     interface{} `gorethink:"array_limit,omitempty"`
	TimeFormat     interface{} `gorethink:"time_format,omitempty"`
	GroupFormat    interface{} `gorethink:"group_format,omitempty"`
	BinaryFormat   interface{} `gorethink:"binary_format,omitempty"`
	GeometryFormat interface{} `gorethink:"geometry_format,omitempty"`
	BatchConf      BatchOpts   `gorethink:"batch_conf,omitempty"`
}

type BatchOpts struct {
	MinBatchRows              interface{} `gorethink:"min_batch_rows,omitempty"`
	MaxBatchRows              interface{} `gorethink:"max_batch_rows,omitempty"`
	MaxBatchBytes             interface{} `gorethink:"max_batch_bytes,omitempty"`
	MaxBatchSeconds           interface{} `gorethink:"max_batch_seconds,omitempty"`
	FirstBatchScaledownFactor interface{} `gorethink:"first_batch_scaledown_factor,omitempty"`
}

func (o *RunOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Run runs a query using the given connection.
//
//	rows, err := query.Run(sess)
//	if err != nil {
//		// error
//	}
//
//  var doc MyDocumentType
//	for rows.Next(&doc) {
//      // Do something with document
//	}
func (t Term) Run(s *Session, optArgs ...RunOpts) (*Cursor, error) {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return s.startQuery(t, opts)
}

// RunWrite runs a query using the given connection but unlike Run automatically
// scans the result into a variable of type WriteResponse. This function should be used
// if you are running a write query (such as Insert,  Update, TableCreate, etc...)
//
//	res, err := r.Db("database").Table("table").Insert(doc).RunWrite(sess, r.RunOpts{
//		NoReply: true,
//	})
func (t Term) RunWrite(s *Session, optArgs ...RunOpts) (WriteResponse, error) {
	var response WriteResponse
	res, err := t.Run(s, optArgs...)
	if err == nil {
		err = res.One(&response)
	}
	return response, err
}

// Exec runs the query but does not return the result.
func (t Term) Exec(s *Session, optArgs ...RunOpts) error {
	res, err := t.Run(s, optArgs...)
	if err != nil {
		return err
	}
	if res == nil {
		return nil
	}

	err = res.Close()
	if err != nil {
		return err
	}

	return nil
}
