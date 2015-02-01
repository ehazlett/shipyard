CGO_ENABLED=0
GOOS=linux
GOARCH=amd64
VERSION=${VERSION:-latest}

all: deps build

deps:
	@godep restore

clean:
	@rm -rf Godeps/_workspace controller

build:
	@godep go build -a -tags 'netgo' -ldflags '-w -linkmode external -extldflags -static' .

media:
	@cd static && bower install --allow-root

image: media build
	@docker build -t shipyard/shipyard:$(VERSION) .

release: deps build image
	@docker push shipyard/shipyard:$(VERSION)

test: clean 
	@godep go test -v ./...

.PHONY: all deps build clean media image test release
