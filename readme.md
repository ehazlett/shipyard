# Shipyard [![Stories in Ready](https://badge.waffle.io/shipyard/shipyard.png?label=ready)](http://waffle.io/shipyard/shipyard)
Shipyard is a web UI for http://docker.io

# Quickstart
Use the [Quickstart](https://github.com/shipyard/shipyard/wiki/QuickStart) to get
started.

# Help
To report issues please use [Github](https://github.com/shipyard/shipyard/issues)

There is also an IRC channel setup on Freenode:  `irc.freenode.net` `#shipyard`

To deploy a local Shipyard stack:

`docker run -i -t -v /var/run/docker.sock:/docker.sock shipyard/deploy setup`

You should be able to login to http://localhost:8000.  You will need to setup
the [Shipyard Agent](https://github.com/shipyard/shipyard-agent) to see containers,
 images, etc.

Username: admin
Password: shipyard

# Dev Setup
Shipyard uses [Fig](http://orchardup.github.io/fig/) for an easy development environment.  Visit that link first to setup Fig.  Then continue:

* `fig up -d redis router lb db`
* `fig run app python manage.py syncdb --noinput`
* `fig run app python manage.py migrate`
* `fig run app python manage.py createsuperuser`
* `fig up app`
* `fig up worker` (in separate terminal to see output)
* Open browser to localhost:8000 for Shipyard and localhost for the LB (you must not have anything else running on port 80)

To rebuild the app image (if you make changes to the `Dockerfile`, etc.):

* `fig build app`
* `fig build worker`

Then restart the app and worker containers as explained above.

# Features

* Multiple host support
* Create / Delete containers
* View Images
* Build Images (via uploaded Dockerfile or URL)
* Import repositories
* Private containers
* Container metadata (description, etc.)
* Applications: bind containers to applications that are setup with [hipache](https://github.com/dotcloud/hipache)
* Attach container (terminal emulation in the browser)
* Container recovery (mark container as "protected" and it will auto-restart upon fail/destroy/stop)
* RESTful API
* ...more coming...

# Screenshots

![Login](http://i.imgur.com/8WGsK2Gh.png)

![Containers](http://i.imgur.com/5DAMDw8h.png)

![Container Details](http://i.imgur.com/QFDtF7C.png)

![Container Logs](http://i.imgur.com/k2aZld8h.png)

![Images](http://i.imgur.com/fMXZ92lh.png)

![Applications](http://i.imgur.com/CgSwTRnh.png)

![Hosts](http://i.imgur.com/KC7D1s0h.png)

![Attach Container](http://i.imgur.com/YhiFq1gh.png)

* Note: for attaching to containers you must have access to the docker host.  This
will change in the future.

# API
Shipyard also has a RESTful JSON based API.

See https://github.com/shipyard/shipyard/wiki/API for API details.

# Applications
Applications are groups of containers that are accessible by a domain name.  The easiest
way to test this is to add some local `/etc/hosts` entries for fake domains pointed to `10.10.10.25` (the vagrant vm).  For example, add the following to `/etc/hosts`:

```
10.10.10.25 foo.local
```

Then you can create a new application with the domain `foo.local`.  Attach one or more containers and then access http://foo.local in your browser and it should hit Hipache and be routed to the containers.

For more info on applications, see [here](https://github.com/shipyard/shipyard/wiki/Applications)



# License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

