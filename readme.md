# Shipyard
Shipyard is a web UI for http://docker.io

# Setup
Shipyard needs Redis for caching and queueing.  By default, it assumes Redis
is running on localhost.

* `pip install -r requirements.txt`
* `python manage.py syncdb`
* `python manage.py migrate`
* `python manage.py runserver`
* `python manage.py rqworker` (in another terminal)
* Open browser to http://localhost:8000

# Features

* Multiple host support
* Create / Delete containers
* View Images
* Import repositories
* ...more coming...
*

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
