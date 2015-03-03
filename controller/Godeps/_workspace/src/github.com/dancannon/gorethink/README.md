GoRethink - RethinkDB Driver for Go [![wercker status](https://app.wercker.com/status/e315e764041af8e80f0c68280d4b4de2/s/master "wercker status")](https://app.wercker.com/project/bykey/e315e764041af8e80f0c68280d4b4de2) [![GoDoc](https://godoc.org/github.com/dancannon/gorethink?status.png)](https://godoc.org/github.com/dancannon/gorethink)
=====================

[Go](http://golang.org/) driver for [RethinkDB](http://www.rethinkdb.com/) made by [Daniel Cannon](http://github.com/dancannon) and based off of Christopher Hesse's [RethinkGo](https://github.com/christopherhesse/rethinkgo) driver.


Current version: v0.5.0 (RethinkDB v1.15.1) 

**Version 0.3 introduced some API changes, for more information check the [change log](CHANGELOG.md)**

## Installation

```sh
go get -u github.com/dancannon/gorethink
```

## Connection

### Basic Connection

Setting up a basic connection with RethinkDB is simple:

```go
import (
    r "github.com/dancannon/gorethink"
)

var session *r.Session

session, err := r.Connect(r.ConnectOpts{
    Address:  "localhost:28015",
    Database: "test",
})

if err != nil {
    log.Fatalln(err.Error())
}

```
See the [documentation](http://godoc.org/github.com/dancannon/gorethink#Connect) for a list of supported arguments to Connect().

### Connection Pool

The driver uses a connection pool at all times, however by default there is only a single connection available. In order to turn this into a proper connection pool, we need to pass the `maxIdle`, `maxActive` and/or `idleTimeout` parameters to Connect():

```go
import (
    r "github.com/dancannon/gorethink"
)

var session *r.Session

session, err := r.Connect(r.ConnectOpts{
    Address:  "localhost:28015",
    Database: "test",
    MaxIdle: 10,
    IdleTimeout: time.Second * 10,
})

if err != nil {
    log.Fatalln(err.Error())
}
```

A pre-configured [Pool](http://godoc.org/github.com/dancannon/gorethink#Pool) instance can also be passed to Connect().

## Query Functions

This library is based on the official drivers so the code on the [API](http://www.rethinkdb.com/api/) page should require very few changes to work.

To view full documentation for the query functions check the [GoDoc](http://godoc.org/github.com/dancannon/gorethink#Term)

Slice Expr Example
```go
r.Expr([]interface{}{1, 2, 3, 4, 5}).Run(session)
```
Map Expr Example
```go
r.Expr(map[string]interface{}{"a": 1, "b": 2, "c": 3}).Run(session)
```
Get Example
```go
r.Db("database").Table("table").Get("GUID").Run(session)
```
Map Example (Func)
```go
r.Expr([]interface{}{1, 2, 3, 4, 5}).Map(func (row Term) interface{} {
    return row.Add(1)
}).Run(session)
```
Map Example (Implicit)
```go
r.Expr([]interface{}{1, 2, 3, 4, 5}).Map(r.Row.Add(1)).Run(session)
```
Between (Optional Args) Example
```go
r.Db("database").Table("table").Between(1, 10, r.BetweenOpts{
    Index: "num",
    RightBound: "closed",
}).Run(session)
```


### Optional Arguments

As shown above in the Between example optional arguments are passed to the function as a struct. Each function that has optional arguments as a related struct. This structs are named in the format FunctionNameOpts, for example BetweenOpts is the related struct for Between.

## Results

Different result types are returned depending on what function is used to execute the query.

- `Run` returns a cursor which can be used to view
all rows returned.
- `RunWrite` returns a WriteResponse and should be used for queries such as Insert,Update,etc...
- `Exec` sends a query to the server with the noreply flag set and returns immediately

Example:

```go
res, err := Table("tablename").Get(key).Run(session)
if err != nil {
    // error
}
```

Cursors have a number of methods available for accessing the query results

- `Next` retrieves the next document from the result set, blocking if necessary.
- `All` retrieves all documents from the result set into the provided slice.
- `One` retrieves the first document from the result se.

Examples:

```go
var row interface{}
for res.Next(&result) {
    // Do something with row
}
if res.Err() != nil {
    // error
}
```

```go
var rows []interface{}
err := res.All(&rows)
if err != nil {
    // error
}
```

```go
var row interface{}
err := res.One(&row)
if err == r.ErrEmptyResult {
    // row not found
}
if err != nil {
    // error
}
```

## Encoding/Decoding Structs
When passing structs to Expr(And functions that use Expr such as Insert, Update) the structs are encoded into a map before being sent to the server. Each exported field is added to the map unless

  - the field's tag is "-", or
  - the field is empty and its tag specifies the "omitempty" option.

Each fields default name in the map is the field name but can be specified in the struct field's tag value. The "gorethink" key in
the struct field's tag value is the key name, followed by an optional comma
and options. Examples:

```go
// Field is ignored by this package.
Field int `gorethink:"-"`
// Field appears as key "myName".
Field int `gorethink:"myName"`
// Field appears as key "myName" and
// the field is omitted from the object if its value is empty,
// as defined above.
Field int `gorethink:"myName,omitempty"`
// Field appears as key "Field" (the default), but
// the field is skipped if empty.
// Note the leading comma.
Field int `gorethink:",omitempty"`
```

Alternatively you can implement the FieldMapper interface  by providing the FieldMap function which returns a map of strings in the form of `"FieldName": "NewName"`. For example:

```go
type A struct {
    Field int
}

func (a A) FieldMap() map[string]string {
    return map[string]string{
        "Field": "myName",
    }
}
```

## Examples

View other examples on the [wiki](https://github.com/dancannon/gorethink/wiki/Examples).

## License

Copyright 2013 Daniel Cannon

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
