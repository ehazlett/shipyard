# Roadmap

## Shipyard 2.1
This is the next major version of Shipyard.  There is quite a bit planned and
some of the features may get bumped to next incremental versions.

### Docker Swarm Integration
When we started v2, libswarm was still very early.  We knew that we wanted to
have cluster capability without hitting each individual Docker API.  Now that
Swarm is here (and is awesome btw) we want to replace the existing backend
with Swarm.  With that will come improved scheduling, full support of Docker
features (i.e. `docker run --rm` etc) and less maintenance enabling us to focus
on Shipyard itself.


### Container Stats
With the release of Docker Engine 1.5, there is now a stats API.  We want to
integrate this into Shipyard to see realtime stats for all containers.


### Docker Compose Integration
There has been a long standing request for 
[Docker Compose](https://github.com/docker/fig) (Fig) integration 
(https://github.com/shipyard/shipyard/issues/172 & 
https://github.com/shipyard/shipyard/issues/270).
We want enable deploying containers from Docker Compose configuration definitions.


### ClusterHQ Powerstrip
The Shipyard extension concept was very similar to this however I think Powerstrip
is better.  We want to take the idea of extensions and use them with Powerstrip.
