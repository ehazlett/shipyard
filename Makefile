CGO_ENABLED=0
GOOS=linux
GOARCH=amd64
TAG=${TAG:-latest}
COMMIT=`git rev-parse --short HEAD`
GO15VENDOREXPERIMENT=1

all: build media

clean:
	@rm -rf controller/controller

build:
	@cd controller && go build -a -tags "netgo static_build" -installsuffix netgo -ldflags "-w -X github.com/shipyard/shipyard/version.GitCommit=$(COMMIT)" .

remote-build:
	@docker build -t shipyard-build -f Dockerfile.build .
	@rm -f ./controller/controller
	@cd controller && docker run --rm -w /go/src/github.com/shipyard/shipyard --entrypoint /bin/bash shipyard-build -c "make build 1>&2 && cd controller && tar -czf - controller" | tar zxf -

media:
	@cd controller/static && bower -s install --allow-root -p | xargs echo > /dev/null

image: media build
	@echo Building Shipyard image $(TAG)
	@cd controller && docker build -t shipyard/shipyard:$(TAG) .

release: build image
	@docker push shipyard/shipyard:$(TAG)

test: clean
 	# TODO: enable registry e2e when they use httptest e2e server instead of external container.
	@go test -v `go list ./... | grep -v /vendor | grep -v /test-assets`

# For dev purposes
docker-build-controller:
	@docker build -t shipyard_controller -f Dockerfile.build .

docker-restart-controller:
	@docker-compose -f docker-compose.yml restart controller

controller-container: docker-build-controller docker-restart-controller

container-logs:
	@docker-compose logs -f docker-compose.yml

run-dev-containers:
	@docker-compose -f docker-compose.yml up

run-container-test:
	@docker-compose -f docker-compose.yml up -d
	@sleep 30
	# TODO: be smarter about the container name. This is hardcoded at the moment.
	@docker exec -it shipyard_controller_1 make test; docker-compose -f docker-compose.yml stop; docker-compose -f docker-compose.yml rm -fv


docker-containers-clean:
	@docker-compose -f docker-compose.yml stop
	@docker-compose -f docker-compose.yml rm -fv

.PHONY: all build clean media image test release
