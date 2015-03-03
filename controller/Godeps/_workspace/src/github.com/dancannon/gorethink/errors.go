package gorethink

import (
	"bytes"
	"errors"
	"fmt"

	p "github.com/dancannon/gorethink/ql2"
)

func printCarrots(t Term, frames []*p.Frame) string {
	var frame *p.Frame
	if len(frames) > 1 {
		frame, frames = frames[0], frames[1:]
	} else if len(frames) == 1 {
		frame, frames = frames[0], []*p.Frame{}
	}

	for i, arg := range t.args {
		if frame.GetPos() == int64(i) {
			t.args[i] = Term{
				termType: p.Term_DATUM,
				data:     printCarrots(arg, frames),
			}
		}
	}

	for k, arg := range t.optArgs {
		if frame.GetOpt() == k {
			t.optArgs[k] = Term{
				termType: p.Term_DATUM,
				data:     printCarrots(arg, frames),
			}
		}
	}

	b := &bytes.Buffer{}
	for _, c := range t.String() {
		if c != '^' {
			b.WriteString(" ")
		} else {
			b.WriteString("^")
		}
	}

	return b.String()
}

// Error constants
var ErrEmptyResult = errors.New("The result does not contain any more rows")

// Connection/Response errors

type rqlResponseError struct {
	response *Response
	term     *Term
}

func (e rqlResponseError) Error() string {
	return fmt.Sprintf("gorethink: %s in: \n%s", e.response.Responses[0], e.term.String())
}

func (e rqlResponseError) String() string {
	return e.Error()
}

type RqlCompileError struct {
	rqlResponseError
}

type RqlRuntimeError struct {
	rqlResponseError
}

type RqlClientError struct {
	rqlResponseError
}

type RqlDriverError struct {
	message string
}

func (e RqlDriverError) Error() string {
	return fmt.Sprintf("gorethink: %s", e.message)
}

func (e RqlDriverError) String() string {
	return e.Error()
}

type RqlConnectionError struct {
	message string
}

func (e RqlConnectionError) Error() string {
	return fmt.Sprintf("gorethink: %s", e.message)
}

func (e RqlConnectionError) String() string {
	return e.Error()
}
