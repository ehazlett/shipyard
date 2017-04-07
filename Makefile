CGO_ENABLED=0
GOOS=linux
GOARCH=amd64
TAG?=latest
COMMIT=`git rev-parse --short HEAD`

UI_BUILD_IMAGE=shipyard-ui-build

all: build ui

clean:
	@rm -rf controller/controller && \
		rm controller/static.tar.gz && \
		rm -rf ui/node_modules

build:
	@cd controller && godep go build -a -tags "netgo static_build" -installsuffix netgo -ldflags "-w -X github.com/shipyard/shipyard/version.GitCommit=$(COMMIT)" .

remote-build:
	@docker build -t shipyard-build -f Dockerfile.build .
	@rm -f ./controller/controller
	@cd controller && docker run --rm -w /go/src/github.com/shipyard/shipyard --entrypoint /bin/bash shipyard-build -c "make build 1>&2 && cd controller && tar -czf - controller" | tar zxf -

ui-build:
	@docker build -t "${UI_BUILD_IMAGE}" -f ui/Dockerfile.build ui

ui-test: ui-build
	@docker run -e "CI=true" --rm -i "${UI_BUILD_IMAGE}" npm test

ui: ui-build ui-test
	@mkdir -p controller/static/ && \
		docker run --rm -i "${UI_BUILD_IMAGE}" | tar xvzf - -C controller/static/

image: ui build
	@echo Building Shipyard image "${TAG}"
	@cd controller && docker build -t shipyard/shipyard:$(TAG) .

release: build image
	@docker push shipyard/shipyard:"${TAG}"

test: clean
	@godep go test -v ./...

.PHONY: all clean build remote-build ui image release test 