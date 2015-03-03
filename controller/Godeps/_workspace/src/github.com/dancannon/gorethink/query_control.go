package gorethink

import (
	"encoding/base64"

	"reflect"

	p "github.com/dancannon/gorethink/ql2"
)

var byteSliceType = reflect.TypeOf([]byte(nil))

// Expr converts any value to an expression.  Internally it uses the `json`
// module to convert any literals, so any type annotations or methods understood
// by that module can be used. If the value cannot be converted, an error is
// returned at query .Run(session) time.
//
// If you want to call expression methods on an object that is not yet an
// expression, this is the function you want.
func Expr(val interface{}) Term {
	return expr(val, 20)
}

func expr(val interface{}, depth int) Term {
	if depth <= 0 {
		panic("Maximum nesting depth limit exceeded")
	}

	if val == nil {
		return Term{
			termType: p.Term_DATUM,
			data:     nil,
		}
	}

	switch val := val.(type) {
	case Term:
		return val
	default:
		// Use reflection to check for other types
		valType := reflect.TypeOf(val)
		valValue := reflect.ValueOf(val)

		switch valType.Kind() {
		case reflect.Func:
			return makeFunc(val)
		case reflect.Struct, reflect.Ptr:
			data, err := encode(val)

			if err != nil || data == nil {
				return Term{
					termType: p.Term_DATUM,
					data:     nil,
				}
			}

			return expr(data, depth-1)

		case reflect.Slice, reflect.Array:
			// Check if slice is a byte slice
			if valType.Elem().Kind() == reflect.Uint8 {
				data, err := encode(val)

				if err != nil || data == nil {
					return Term{
						termType: p.Term_DATUM,
						data:     nil,
					}
				}

				return expr(data, depth-1)
			} else {
				vals := []Term{}
				for i := 0; i < valValue.Len(); i++ {
					vals = append(vals, expr(valValue.Index(i).Interface(), depth))
				}

				return makeArray(vals)
			}
		case reflect.Map:
			vals := map[string]Term{}
			for _, k := range valValue.MapKeys() {
				vals[k.String()] = expr(valValue.MapIndex(k).Interface(), depth)
			}

			return makeObject(vals)
		default:
			return Term{
				termType: p.Term_DATUM,
				data:     val,
			}
		}
	}
}

// Create a JavaScript expression.
func Js(jssrc interface{}) Term {
	return constructRootTerm("Js", p.Term_JAVASCRIPT, []interface{}{jssrc}, map[string]interface{}{})
}

type HttpOpts struct {
	// General Options
	Timeout      interface{} `gorethink:"timeout,omitempty"`
	Reattempts   interface{} `gorethink:"reattempts,omitempty"`
	Redirects    interface{} `gorethink:"redirect,omitempty"`
	Verify       interface{} `gorethink:"verify,omitempty"`
	ResultFormat interface{} `gorethink:"resul_format,omitempty"`

	// Request Options
	Method interface{} `gorethink:"method,omitempty"`
	Auth   interface{} `gorethink:"auth,omitempty"`
	Params interface{} `gorethink:"params,omitempty"`
	Header interface{} `gorethink:"header,omitempty"`
	Data   interface{} `gorethink:"data,omitempty"`

	// Pagination
	Page      interface{} `gorethink:"page,omitempty"`
	PageLimit interface{} `gorethink:"page_limit,omitempty"`
}

func (o *HttpOpts) toMap() map[string]interface{} {
	return optArgsToMap(o)
}

// Parse a JSON string on the server.
func Http(url interface{}, optArgs ...HttpOpts) Term {
	opts := map[string]interface{}{}
	if len(optArgs) >= 1 {
		opts = optArgs[0].toMap()
	}
	return constructRootTerm("Http", p.Term_HTTP, []interface{}{url}, opts)
}

// Parse a JSON string on the server.
func Json(args ...interface{}) Term {
	return constructRootTerm("Json", p.Term_JSON, args, map[string]interface{}{})
}

// Throw a runtime error. If called with no arguments inside the second argument
// to `default`, re-throw the current error.
func Error(args ...interface{}) Term {
	return constructRootTerm("Error", p.Term_ERROR, args, map[string]interface{}{})
}

// Args is a special term usd to splice an array of arguments into another term.
// This is useful when you want to call a varadic term such as GetAll with a set
// of arguments provided at runtime.
func Args(args ...interface{}) Term {
	return constructRootTerm("Args", p.Term_ARGS, args, map[string]interface{}{})
}

// Binary encapsulates binary data within a query.
func Binary(data interface{}) Term {
	var b []byte

	switch data := data.(type) {
	case Term:
		return constructRootTerm("Binary", p.Term_BINARY, []interface{}{data}, map[string]interface{}{})
	case []byte:
		b = data
	default:
		typ := reflect.TypeOf(data)
		if (typ.Kind() == reflect.Slice || typ.Kind() == reflect.Array) &&
			typ.Elem().Kind() == reflect.Uint8 {
			return Binary(reflect.ValueOf(data).Bytes())
		}
		panic("Unsupported binary type")
	}

	return binaryTerm(base64.StdEncoding.EncodeToString(b))
}

func binaryTerm(data string) Term {
	t := constructRootTerm("Binary", p.Term_BINARY, []interface{}{}, map[string]interface{}{})
	t.data = data

	return t
}

// Evaluate the expr in the context of one or more value bindings. The type of
// the result is the type of the value returned from expr.
func (t Term) Do(args ...interface{}) Term {
	newArgs := []interface{}{}
	newArgs = append(newArgs, funcWrap(args[len(args)-1]))
	newArgs = append(newArgs, t)
	newArgs = append(newArgs, args[:len(args)-1]...)

	return constructRootTerm("Do", p.Term_FUNCALL, newArgs, map[string]interface{}{})
}

// Evaluate the expr in the context of one or more value bindings. The type of
// the result is the type of the value returned from expr.
func Do(args ...interface{}) Term {
	newArgs := []interface{}{}
	newArgs = append(newArgs, funcWrap(args[len(args)-1]))
	newArgs = append(newArgs, args[:len(args)-1]...)

	return constructRootTerm("Do", p.Term_FUNCALL, newArgs, map[string]interface{}{})
}

// Evaluate one of two control paths based on the value of an expression.
// branch is effectively an if renamed due to language constraints.
//
// The type of the result is determined by the type of the branch that gets executed.
func Branch(args ...interface{}) Term {
	return constructRootTerm("Branch", p.Term_BRANCH, args, map[string]interface{}{})
}

// Loop over a sequence, evaluating the given write query for each element.
func (t Term) ForEach(args ...interface{}) Term {
	return constructMethodTerm(t, "Foreach", p.Term_FOREACH, funcWrapArgs(args), map[string]interface{}{})
}

// Handle non-existence errors. Tries to evaluate and return its first argument.
// If an error related to the absence of a value is thrown in the process, or if
// its first argument returns null, returns its second argument. (Alternatively,
// the second argument may be a function which will be called with either the
// text of the non-existence error or null.)
func (t Term) Default(args ...interface{}) Term {
	return constructMethodTerm(t, "Default", p.Term_DEFAULT, args, map[string]interface{}{})
}

// Converts a value of one type into another.
//
// You can convert: a selection, sequence, or object into an ARRAY, an array of
// pairs into an OBJECT, and any DATUM into a STRING.
func (t Term) CoerceTo(args ...interface{}) Term {
	return constructMethodTerm(t, "CoerceTo", p.Term_COERCE_TO, args, map[string]interface{}{})
}

// Gets the type of a value.
func (t Term) TypeOf(args ...interface{}) Term {
	return constructMethodTerm(t, "TypeOf", p.Term_TYPEOF, args, map[string]interface{}{})
}

// Get information about a RQL value.
func (t Term) Info(args ...interface{}) Term {
	return constructMethodTerm(t, "Info", p.Term_INFO, args, map[string]interface{}{})
}

// UUID returns a UUID (universally unique identifier), a string that can be used as a unique ID.
func UUID(args ...interface{}) Term {
	return constructRootTerm("UUID", p.Term_UUID, []interface{}{}, map[string]interface{}{})
}
