CGO_ENABLED=0
GOOS=linux
GOARCH=amd64
TAG=${TAG:-latest}
COMMIT=`git rev-parse --short HEAD`

all: deps build media

deps:
	@godep restore

clean:
	@rm -rf Godeps/_workspace controller

build:
	@godep go build -ldflags "-w -X github.com/shipyard/shipyard/version.GitCommit $(COMMIT)" .

media:
	@cd static && bower -s install --allow-root -p | xargs echo

image: media build
	@echo Building Shipyard image $(TAG)
	@docker build -t shipyard/shipyard:$(TAG) .

release: deps build image
	@docker push shipyard/shipyard:$(TAG)

test: clean 
	@godep go test -v ./...

.PHONY: all deps build clean media image test release
