# Shipyard
Composable Docker Management


[![Build Status](https://travis-ci.org/shipyard/shipyard.svg?branch=master)](https://travis-ci.org/shipyard/shipyard)

Shipyard enables multi-host, Docker cluster management.  It uses [Docker Swarm](https://docs.docker.com/swarm) for cluster resourcing and scheduling.

# Quick Start
There is a deploy script provided on the Shipyard website for quick
installation.

> Note: you must already have a Docker engine available.  If you do not have
Docker, you can use [Docker Machine](https://github.com/docker/machine) to
get started.

```
curl -s https://shipyard-project.com/deploy | bash -s
```

For full options:

```
curl -s https://shipyard-project.com/deploy | bash -s -- -h
```

# Documentation
Full docs are available at http://shipyard-project.com

# Components
There are three components to Shipyard:

## Controller
The Shipyard controller talks to a RethinkDB instance for data storage (user accounts, engine addresses, events, etc).  It also serves the API and web interface (see below).  The controller uses Citadel to communicate to each host and handle cluster events.

## API
Everything in Shipyard is built around the Shipyard API.  It enables actions such as starting, stopping and inspecting containers, adding and removing engines and more.  It is a very simple RESTful JSON based API.

## UI
The Shipyard UI is a web interface to the Shipyard cluster.  It uses the Shipyard API for all interaction.  It is an AngularJS app that is served via the Controller.

# Contributing

## Controller
To get a development environment you will need:

* Go 1.4+
* Node.js: (npm for bower to build the Angular frontend)

Run the following:

* install [Godep](https://github.com/tools/godep): `go get github.com/tools/godep`
* run `npm install -g bower` to install bower
* run `make build` to build the binary
* run `make media` to build the media
* run `./controller -h` for options

# License
Shipyard is licensed under the Apache License, Version 2.0. See LICENSE for full license text.
