# Roadmap

## Shipyard 3.0
This is the next major version of Shipyard.  There is quite a bit planned and
some of the features may get bumped to next incremental versions.

### Docker Swarm Integration
When we started v2, libswarm was still very early.  We knew that we wanted to
have cluster capability without hitting each individual Docker API.  Now that
Swarm is here (and is awesome btw) we want to replace the existing backend
with Swarm.  With that will come improved scheduling, full support of Docker
features (i.e. `docker run --rm` etc) and less maintenance enabling us to focus
on Shipyard itself.

### Docker Registry
There has been lots of interest in managing a private Docker Registry.  Shipyard v3 will contain registry management including managing and deploying from repositories.

### Interlock
This will bring the "composable" management to Shipyard.  Interlock has a plugin system that allows the selection of plugins including application routing and load balancing to stats and more.  These can be enabled / disabled at user discretion.

### Docker Machine Integration
This would enable provisioning of Docker Engines in all providers supported by Machine.  These nodes could then be used to create or scale a Swarm cluster.

### Docker Compose Integration
There has been a long standing request for 
[Docker Compose](https://github.com/docker/fig) (Fig) integration 
(https://github.com/shipyard/shipyard/issues/172 & 
https://github.com/shipyard/shipyard/issues/270).
We want enable deploying containers from Docker Compose configuration definitions.
