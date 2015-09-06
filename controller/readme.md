# Shipyard Controller
This is the core component for Shipyard.

# Setup
The only thing Shipyard needs to run is RethinkDB.

* Run RethinkDB: `docker run -it -d --name rethinkdb -P shipyard/rethinkdb`

* Run Shipyard: `docker run -it --name -P --link rethinkdb:rethinkdb shipyard/shipyard`
