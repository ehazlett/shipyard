package encoding

import "reflect"

// Marshaler is the interface implemented by objects that
// can marshal themselves into a valid RQL psuedo-type.
type Marshaler interface {
	MarshalRQL() (interface{}, error)
}

// Unmarshaler is the interface implemented by objects
// that can unmarshal a psuedo-type object of themselves.
type Unmarshaler interface {
	UnmarshalRQL(interface{}) error
}

func init() {
	encoderCache.m = make(map[reflect.Type]encoderFunc)
}
