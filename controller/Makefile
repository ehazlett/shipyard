all: deps build

deps:
	@godep restore

clean:
	@rm -rf Godeps/_workspace controller
build:
	@godep go build .

test: clean 
	@# set the GOPATH because godep on drone does not 
	@# have the env vars injected from drone
	@# fuck computers
	@godep restore
	@export GOPATH=$GOPATH:$(pwd)/Godeps/_workspace
	@go test -v ./...

test-drone: clean 
	@# set the GOPATH because godep on drone does not 
	@# have the env vars injected from drone
	@# fuck computers
	@/var/cache/drone/bin/godep restore
	@export GOPATH=$GOPATH:$(pwd)/Godeps/_workspace
	@go test -v ./...

.PHONY: all deps build clean test
