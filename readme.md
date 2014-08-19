# Shipyard
Docker Management

Shipyard enables multi-host, Docker cluster management.  It uses the [Citadel](https://github.com/citadel/citadel) toolkit for cluster resourcing and scheduling.  Shipyard has been dramatically simiplified and only requires access to the Docker Remote API and a RethinkDB instance.

# Quick Start

* `docker run -d -P shipyard/rethinkdb`
* `docker run -d -p 80:8080 shipyard/shipyard -rethinkdb-addr <rethinkdb-host>:<rethinkdb:port>`

You can then use the Shipyard CLI to interact:

* `docker run --rm -it shipyard/shipyard-cli --host http://<shipyard-host>`
* `docker run --rm -it shipyard/shipyard-cli -h`

# Components
There are four components to Shipyard.

## Controller
The Shipyard controller talks to a RethinkDB instance for data storage (user accounts, engine addresses, events, etc).  It also serves the API and web interface (see below).  The controller uses Citadel to communcate to each host and handle cluster events.

## API
Everything in Shipyard is built around the Shipyard API.  It enables actions such as starting, stopping and inspecting containers, adding and removing engines and more.  It is a very simple RESTful JSON based API.

## CLI
The Shipyard CLI is a Docker inspired command line interface to a Shipyard cluster.  It has been built from the ground up to support every feature that Shipyard offers.

## UI
The Shipyard UI is a web interface to the Shipyard cluster.  It uses the Shipyard API for all interaction.
