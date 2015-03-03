package encoding

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"
)

// An InvalidEncodeError describes an invalid argument passed to Encode.
// (The argument to Encode must be a non-nil pointer.)
type InvalidEncodeError struct {
	Type reflect.Type
}

func (e *InvalidEncodeError) Error() string {
	if e.Type == nil {
		return "gorethink: Encode(nil)"
	}

	if e.Type.Kind() != reflect.Ptr {
		return "gorethink: Encode(non-pointer " + e.Type.String() + ")"
	}
	return "gorethink: Encode(nil " + e.Type.String() + ")"
}

type MarshalerError struct {
	Type reflect.Type
	Err  error
}

func (e *MarshalerError) Error() string {
	return "gorethink: error calling MarshalRQL for type " + e.Type.String() + ": " + e.Err.Error()
}

// An UnsupportedTypeError is returned by Marshal when attempting
// to encode an unsupported value type.
type UnsupportedTypeError struct {
	Type reflect.Type
}

func (e *UnsupportedTypeError) Error() string {
	return "gorethink: unsupported type: " + e.Type.String()
}

type UnsupportedValueError struct {
	Value reflect.Value
	Str   string
}

func (e *UnsupportedValueError) Error() string {
	return "gorethink: unsupported value: " + e.Str
}

// An DecodeTypeError describes a value that was
// not appropriate for a value of a specific Go type.
type DecodeTypeError struct {
	Value string       // description of value - "bool", "array", "number -5"
	Type  reflect.Type // type of Go value it could not be assigned to
}

func (e *DecodeTypeError) Error() string {
	return "gorethink: cannot decode " + e.Value + " into Go value of type " + e.Type.String()
}

// An DecodeFieldError describes a object key that
// led to an unexported (and therefore unwritable) struct field.
// (No longer used; kept for compatibility.)
type DecodeFieldError struct {
	Key   string
	Type  reflect.Type
	Field reflect.StructField
}

func (e *DecodeFieldError) Error() string {
	return "gorethink: cannot decode object key " + strconv.Quote(e.Key) + " into unexported field " + e.Field.Name + " of type " + e.Type.String()
}

// An InvalidDecodeError describes an invalid argument passed to Decode.
// (The argument to Decode must be a non-nil pointer.)
type InvalidDecodeError struct {
	Type reflect.Type
}

func (e *InvalidDecodeError) Error() string {
	if e.Type == nil {
		return "gorethink: Decode(nil)"
	}

	if e.Type.Kind() != reflect.Ptr {
		return "gorethink: Decode(non-pointer " + e.Type.String() + ")"
	}
	return "gorethink: Decode(nil " + e.Type.String() + ")"
}

// Error implements the error interface and can represents multiple
// errors that occur in the course of a single decode.
type Error struct {
	Errors []string
}

func (e *Error) Error() string {
	points := make([]string, len(e.Errors))
	for i, err := range e.Errors {
		points[i] = fmt.Sprintf("* %s", err)
	}

	return fmt.Sprintf(
		"%d error(s) decoding:\n\n%s",
		len(e.Errors), strings.Join(points, "\n"))
}

func appendErrors(errors []string, err error) []string {
	switch e := err.(type) {
	case *Error:
		return append(errors, e.Errors...)
	default:
		return append(errors, e.Error())
	}
}
