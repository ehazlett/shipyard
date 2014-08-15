# Shipyard Controller
This is the core component for Shipyard.

# Setup
The only thing Shipyard needs to run is RethinkDB.

* Start RethinkDB: `docker run -P -d ehazlett/rethinkdb`
  * Create a database: `shipyard`
* Run Shipyard: `docker run -it ehazlett/shipyard:v2 -rethinkdb-addr <rethinkdb-host>:<rethinkdb-port>`

You can then use the [Shipyard CLI](../cli/readme.md) to manage.
