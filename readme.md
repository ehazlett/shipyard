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

Create a 1.12.0-rc3 VM:

```shell
docker-machine create -d virtualbox --virtualbox-boot2docker-url "https://github.com/boot2docker/boot2docker/releases/download/v1.12.0-rc3/boot2docker.iso" shipyard
```

Build and deploy shipyard:

```shell
eval $(docker-machine env shipyard)
docker-compose build
docker-compose up
```

Run UI development environment (webpack-dev-middleware):

```shell
# Ensure that the UI dev environment runs on your host, not a VM
unset {DOCKER_HOST,DOCKER_TLS_VERIFY,DOCKER_CERT_PATH}

# Set up the CONTROLLER_URL env var to point to the running controller backend
echo -e "CONTROLLER_URL=http://$(docker-machine ip shipyard):8080/" > .env

docker-compose -f docker-compose.ui.yml up
```

# License
Shipyard is licensed under the Apache License, Version 2.0. See LICENSE for full license text.
