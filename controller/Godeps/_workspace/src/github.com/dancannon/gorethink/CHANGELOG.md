# Changelog

## v0.5.0 - 6 Oct 2014

- Added geospatial terms (`Circle`, `Distance`, `Fill`, `Geojson`, `ToGeojson`, `GetIntersecting`, `GetNearest`, `Includes`, `Intersects`, `Line`, `Point`, `Polygon`, `PolygonSub`)
- Added `UUID` term for generating unique IDs
- Added `AtIndex` term, combines `Nth` and `GetField`
- Added the `Geometry` type, see the types package
- Updated the `BatchConf` field in `RunOpts`, now uses the `BatchOpts` type
- Removed support for the `FieldMapper` interface

### Internal Changes
- Fixed encoding performance issues, greatly improves writes/second
- Updated `Next` to zero the destination value every time it is called.

## v0.4.2 - 6 Sept 2014

- Fixed issue causing `Close` to start an infinite loop
- Tidied up connection closing logic

## v0.4.1 - 5 Sept 2014

- Fixed bug causing Pseudotypes to not be decoded properly (#117)
- Updated github.com/fatih/pool to v2 (#118)

## v0.4.0 - 13 Aug 2014

- Updated the driver to support RethinkDB v1.14 (#116)
- Added the Binary data type
- Added the Binary command which takes a `[]byte`, `io.Reader` or `bytes.Buffer{}` as an argument.
- Added the `BinaryFormat` optional argument to `RunOpts` 
- Added the `GroupFormat` optional argument to `RunOpts` 
- Added the `ArrayLimit` optional argument to `RunOpts` 
- Renamed the `ReturnVals` optional argument to `ReturnChanges` 
- Renamed the `Upsert` optional argument to `Conflict` 
- Added the `IndexRename` command
- Updated `Distinct` to now take the `Index` optional argument (using `DistinctOpts`)

### Internal Changes

- Updated to use the new JSON protocol
- Switched the connection pool code to use github.com/fatih/pool
- Added some benchmarks

## v0.3.2 - 17 Aug 2014

- Fixed issue causing connections not to be closed correctly (#109)
- Fixed issue causing terms in optional arguments to be encoded incorrectly (#114)

## v0.3.1 - 14 June 2014

- Fixed "Token ## not in stream cache" error (#103)
- Changed Exec to no longer use NoReply. It now waits for the server to respond.

## v0.3 (RethinkDB v1.13) - 26 June 2014

- Replaced `ResultRows`/`ResultRow` with `Cursor`, `Cursor` has the `Next`, `All` and `One` methods which stores the relevant value in the value pointed at by result. For more information check the examples.
- Changed the time constants (Days and Months) to package globals instead of functions
- Added the `Args` term and changed the arguments for many terms to `args ...interface{}` to allow argument splicing
- Added the `Changes` term and support for the feed response type
- Added the `Random` term
- Added the `Http` term
- The second argument for `Slice` is now optional
- `EqJoin` now accepts a function as its first argument
- `Nth` now returns a selection

## v0.2 (RethinkDB v1.12) - 13 April 2014

* Changed `Connect` to use `ConnectOpts` instead of `map[string]interface{}`
* Migrated to new `Group`/`Ungroup` functions, these replace `GroupedMapReduce` and `GroupBy`
* Added new aggregators
* Removed base parameter for `Reduce`
* Added `Object` function
* Added `Upcase`, `Downcase` and `Split` string functions
* Added `GROUPED_DATA` pseudotype
* Fixed query printing

## v0.1 (RethinkDB v1.11) - 27 November 2013

* Added noreply writes
* Added the new terms `index_status`, `index_wait` and `sync`
* Added the profile flag to the run functions
* Optional arguments are now structs instead of key, pair strings. Almost all of the struct fields are of type interface{} as they can have terms inside them. For example: `r.TableCreateOpts{ PrimaryKey: r.Expr("index") }`
* Returned arrays are now properly loaded into ResultRows. In the past when running `r.Expr([]interface{}{1,2,3})` would require you to use `RunRow` followed by `Scan`. You can now use `Run` followed by `ScanAll`
