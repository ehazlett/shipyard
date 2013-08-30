# Shipyard
Shipyard is a web UI for http://docker.io

To run the latest version on port 8000:

`docker run -p :8000 ehazlett/shipyard`

Or to run on a custom port (leave the `-p` option off to get random port):

`docker run -p 8005:8000 ehazlett/shipyard`

Username: admin
Password: shipyard

# Dev Setup
Shipyard needs Redis for caching and queueing.  By default, it assumes Redis
is running on localhost.

* `pip install -r requirements.txt`
* `python manage.py syncdb --noinput`
* `python manage.py migrate`
* `python manage.py createsuperuser`
* `python manage.py runserver`
* `python manage.py rqworker shipyard` (in another terminal)
* Open browser to http://localhost:8000
* Add a host (i.e. 127.0.0.1 for local docker)

Alternate dev setup using vagrant:

* `vagrant up`
* `vagrant ssh`
* `python manage.py syncdb --noinput`
* `python manage.py migrate`
* `python manage.py createsuperuser`
* `./manage.py runserver 0.0.0.0:8000`
* `./manage.py rqworker shipyard` (in separate ssh session)
* Open browser to http://localhost:8000

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
* ...more coming...

# Screenshots

![Login](http://i.imgur.com/7xYjQ5a.png)

![Dashboard](http://i.imgur.com/pQrk3mu.png)

![Create Container](http://i.imgur.com/jLgyxUz.png)

![Attach Container](http://i.imgur.com/qlutzmH.png)

# Applications
Applications are groups of containers that are accessible by a domain name.  The easiest
way to test this is to add some local `/etc/hosts` entries for fake domains pointed to `10.10.10.25` (the vagrant vm).  For example, add the following to `/etc/hosts`:

```
10.10.10.25 foo.local
```

Then you can create a new application with the domain `foo.local`.  Attach one or more containers and then access http://foo.local in your browser and it should hit Hipache and be routed to the contianers.

For more info on applications, see [here](https://github.com/ehazlett/shipyard/wiki/Applications)



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

