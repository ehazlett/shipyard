package gorethink

import (
	"errors"
	"reflect"
	"sync"

	"github.com/dancannon/gorethink/encoding"
	p "github.com/dancannon/gorethink/ql2"
)

// Cursors are used to represent data returned from the database.
//
// The code for this struct is based off of mgo's Iter and the official
// python driver's cursor.
type Cursor struct {
	mu      sync.Mutex
	session *Session
	conn    *Connection
	query   Query
	term    Term
	opts    map[string]interface{}

	err                 error
	outstandingRequests int
	closed              bool
	finished            bool
	responses           []*Response
	profile             interface{}
	buffer              []interface{}
}

// Profile returns the information returned from the query profiler.
func (c *Cursor) Profile() interface{} {
	c.mu.Lock()
	defer c.mu.Unlock()

	return c.profile
}

// Err returns nil if no errors happened during iteration, or the actual
// error otherwise.
func (c *Cursor) Err() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	return c.err
}

// Close closes the cursor, preventing further enumeration. If the end is
// encountered, the cursor is closed automatically. Close is idempotent.
func (c *Cursor) Close() error {
	c.mu.Lock()

	if !c.closed && !c.finished {
		c.mu.Unlock()
		err := c.session.stopQuery(c)
		c.mu.Lock()

		if err != nil && (c.err == nil || c.err == ErrEmptyResult) {
			c.err = err
		}
		c.closed = true
	}

	err := c.conn.Close()
	if err != nil {
		return err
	}

	err = c.err
	c.mu.Unlock()

	return err
}

// Next retrieves the next document from the result set, blocking if necessary.
// This method will also automatically retrieve another batch of documents from
// the server when the current one is exhausted, or before that in background
// if possible.
//
// Next returns true if a document was successfully unmarshalled onto result,
// and false at the end of the result set or if an error happened.
// When Next returns false, the Err method should be called to verify if
// there was an error during iteration.
func (c *Cursor) Next(result interface{}) bool {
	c.mu.Lock()

	// Load more data if needed
	for c.err == nil {
		// Check if response is closed/finished
		if len(c.buffer) == 0 && len(c.responses) == 0 && c.closed {
			c.err = errors.New("connection closed, cannot read cursor")
			c.mu.Unlock()
			return false
		}
		if len(c.buffer) == 0 && len(c.responses) == 0 && c.finished {
			c.mu.Unlock()
			return false
		}

		// Start precomputing next batch
		if len(c.responses) == 1 && !c.finished {
			c.mu.Unlock()
			if err := c.session.asyncContinueQuery(c); err != nil {
				c.err = err
				return false
			}
			c.mu.Lock()
		}

		// If the buffer is empty fetch more results
		if len(c.buffer) == 0 {
			if len(c.responses) == 0 && !c.finished {
				c.mu.Unlock()
				if err := c.session.continueQuery(c); err != nil {
					c.err = err
					return false
				}
				c.mu.Lock()
			}

			// Load the new response into the buffer
			if len(c.responses) > 0 {
				var err error
				c.buffer = c.responses[0].Responses
				if err != nil {
					c.err = err
					c.mu.Unlock()
					return false
				}
				c.responses = c.responses[1:]
			}
		}

		// If the buffer is no longer empty then move on otherwise
		// try again
		if len(c.buffer) > 0 {
			break
		}
	}

	if c.err != nil {
		c.mu.Unlock()
		return false
	}

	var data interface{}
	data, c.buffer = c.buffer[0], c.buffer[1:]

	data, err := recursivelyConvertPseudotype(data, c.opts)
	if err != nil {
		c.err = err
		c.mu.Unlock()
		return false
	}

	c.mu.Unlock()
	err = encoding.Decode(result, data)
	if err != nil {
		c.mu.Lock()
		if c.err == nil {
			c.err = err
		}
		c.mu.Unlock()

		return false
	}

	return true
}

// All retrieves all documents from the result set into the provided slice
// and closes the cursor.
//
// The result argument must necessarily be the address for a slice. The slice
// may be nil or previously allocated.
func (c *Cursor) All(result interface{}) error {
	resultv := reflect.ValueOf(result)
	if resultv.Kind() != reflect.Ptr || resultv.Elem().Kind() != reflect.Slice {
		panic("result argument must be a slice address")
	}
	slicev := resultv.Elem()
	slicev = slicev.Slice(0, slicev.Cap())
	elemt := slicev.Type().Elem()
	i := 0
	for {
		if slicev.Len() == i {
			elemp := reflect.New(elemt)
			if !c.Next(elemp.Interface()) {
				break
			}
			slicev = reflect.Append(slicev, elemp.Elem())
			slicev = slicev.Slice(0, slicev.Cap())
		} else {
			if !c.Next(slicev.Index(i).Addr().Interface()) {
				break
			}
		}
		i++
	}
	resultv.Elem().Set(slicev.Slice(0, i))
	return c.Close()
}

// One retrieves a single document from the result set into the provided
// slice and closes the cursor.
func (c *Cursor) One(result interface{}) error {
	if c.IsNil() {
		return ErrEmptyResult
	}

	var err error
	ok := c.Next(result)
	if !ok {
		err = c.Err()
		if err == nil {
			err = ErrEmptyResult
		}
	}

	if e := c.Close(); e != nil {
		err = e
	}

	return err
}

// Tests if the current row is nil.
func (c *Cursor) IsNil() bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	return (len(c.responses) == 0 && len(c.buffer) == 0) || (len(c.buffer) == 1 && c.buffer[0] == nil)
}

func (c *Cursor) extend(response *Response) {
	c.mu.Lock()
	c.finished = response.Type != p.Response_SUCCESS_PARTIAL &&
		response.Type != p.Response_SUCCESS_FEED
	c.responses = append(c.responses, response)

	// Prefetch results if needed
	if len(c.responses) == 1 && !c.finished {
		if err := c.session.asyncContinueQuery(c); err != nil {
			c.err = err
			return
		}
	}

	// Load the new response into the buffer
	var err error
	c.buffer = c.responses[0].Responses
	if err != nil {
		c.err = err

		return
	}
	c.responses = c.responses[1:]
	c.mu.Unlock()
}
