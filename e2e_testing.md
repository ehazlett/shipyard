# Guide to end-to-end (e2e) testing Shipyard / ILM

## TODOs

    * Consider the registry testing in these instructions.

> It is **assumed** that we the `make test` commands are run in the 
> working directory of the Shipyard / ILM source code.

## Testing from host

    * Run all Shipyard / ILM containers using docker compose
    * From your host, run `make test` with the correct environment variables to point to Shipyard / ILM and RethinkDB.

### Example:

    ```
    # Run all containers (controller, db, etc.)
    docker-compose -f docker-compose.yml up -d
    
    # Assuming that the RethinkDB container is mapped to port 8084
    export SHIPYARD_RETHINKDB_URI="localhost:8084" && make test 
    ```

## Testing from within a docker container

    * Run all Shipyard / ILM containers using docker compose
    * Execute `make test` from within the Shipyard / ILM `controller` container.

### Example:

    ```
    # Run all containers (controller, db, etc.)
    docker-compose -f docker-compose.yml up -d 
    
    # exec into the container
    docker exec -it shipyard_controller_1 make test
    ```
