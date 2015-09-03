# Shipyard

Composable Docker Management

Shipyard enables multi-host, Docker cluster management.  It uses [Docker Swarm](https://docs.docker.com/swarm) for cluster resourcing and scheduling.

# Quick Start

## Option 1: Shipyard Deploy
This will launch an entire stack.  It uses [Docker Machine](https://docs.docker.com/machine) and the [Docker CLI](https://docs.docker.com) to create
a Docker Swarm.  It will then deploy Shipyard to manage the Swarm.  When it is finished,
Shipyard will be configured to manage the Swarm and be ready to go.

> Shipyard Deploy can use any provider supported by Docker Machine

### Deploy using the VirtualBox Provider

  Note: you must have VirtualBox installed.

```
curl -s https://shipyard-project.com/deploy | bash -s
```

For full options:

```
curl -s https://shipyard-project.com/deploy | bash -s -- -h
```

## Option 2: Manual Deployment (advanced users)

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
