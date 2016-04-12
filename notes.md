- In the configuration file(currently clair_config/config/yaml) the postgres access string doesnt follow the standard format, and instead uses a custom format for clair:
 `"host=<name of the postgres container> sslmode=disable user=<postgres user> password=<postgres password> dbname="`

- need to do a `go get github.com/coreos/clair` in order to add the dependency

- in the `config.yaml`, specify the host as the docker ip, like so `"host=172.17.0.1 sslmode=disable user=postgres password=postgres dbname="`

- remove the linking in the `docker-compose.yml` which points to `postgres` from `clair`

- in order to run the image analize local tool(it still uses the clair container, but for local images in the host machine) you need to move to contrib/analyze-local-images and issue the following command:
 `go run main.go -endpoint "http://127.0.0.1:6060" -my-address "localhost" <imagename>`
 with big images(over 100 mb) it can take a while to scan, please be patient.

- in order to synchronize you need to start the postgres container first and once that is up and ready for connections start the clair container.