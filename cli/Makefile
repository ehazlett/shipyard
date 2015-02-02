TAG=${TAG:-latest}

all: deps build

deps:
	@godep restore

clean:
	@rm -rf Godeps/_workspace controller

build:
	@godep go build .

image: build
	@docker build -t shipyard/shipyard-cli:$(TAG) .

release: image
	@docker push shipyard/shipyard-cli:$(TAG)

test: clean 
	@godep restore
	@export GOPATH=$GOPATH:$(pwd)/Godeps/_workspace
	@godep go test -v ./...

.PHONY: all deps build clean image test release
