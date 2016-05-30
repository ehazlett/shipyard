CGO_ENABLED=0
GOOS=linux
GOARCH=amd64
TAG?="latest"
COMMIT=`git rev-parse --short HEAD`
GO_VERSION=$(shell go version)
COMPATIBLE_VERSION=1.5

#if GO_VERSION is later than COMPATIBLE_VERSION.
ifeq ($(firstword $(sort $(COMPATIBLE_VERSION) $(subst go,,$(filter go%,$(GO_VERSION))))),$(COMPATIBLE_VERSION))
	BUILD_FLAGS="-w -X github.com/shipyard/shipyard/version.GitCommit=$(COMMIT)"
else
	BUILD_FLAGS="-w -X github.com/shipyard/shipyard/version.GitCommit $(COMMIT)"
endif

all: build media

clean:
	@rm -rf controller/controller

build:
	@cd controller && godep go build -a -tags "netgo static_build" -installsuffix netgo -ldflags $(BUILD_FLAGS) .

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
	@godep go test -v ./...

.PHONY: all build clean media image test release
