# Jan. 20, 2014

This is a major release.  This adds the new [Shipyard Agent](https://github.com/shipyard/shipyard-agent) support.

* merged Agent branch (see the [Agent Migration](https://github.com/shipyard/shipyard/wiki/Agent-Migration) docs for instructions on migrating)
* UI updates: re-org ; shows volumes ; env vars are in tab (not shown by default)
* updated for docker 0.7.6

# Dec. 1, 2013
Release: [d9d2b452](https://github.com/shipyard/shipyard/commit/d9d2b452)

This release adds various fixes and updates for Docker 0.7 support.

* All container operations now use full container IDs (will still show short IDs in UI)
* Fixed issue with Docker 0.7 hosts (related to container IDs) where new containers would not save the description
* Fixes responsive UI issues (login and menus on small devices)
* Ability to login via API (`POST` to `/api/login`)
* Updated API docs with new API login details (https://github.com/shipyard/shipyard/wiki/API#authentication)
* Added new container environment variable to specify the number of Celery workers: `CELERY_WORKERS` (still defaults to 4)
* Added a simple deployment script (Fabric) that automates the production deployment doc (https://github.com/shipyard/shipyard/wiki/Deployment#shipyard-production-deployment)
* Added ability to specify container hostname
* Added support for Docker links

