CGO_ENABLED=0
GOOS=linux
GOARCH=amd64
TAG?=latest
COMMIT=`git rev-parse --short HEAD`
export GO15VENDOREXPERIMENT=1

all: build media

add-deps:
	@godep save
	@rm -rf Godeps

dev-setup:
	@echo "This could take a while..."
	@npm install --loglevel verbose -g gulp browserify babelify
	@cd controller && cd public && npm install --loglevel verbose
	@cd controller && cd public/node_modules/semantic-ui && gulp install

build:
	@cd controller && godep go build -a -tags "netgo static_build" -installsuffix netgo -ldflags "-w -X github.com/shipyard/shipyard/version.GitCommit=$(COMMIT)" .

remote-build:
	@docker build -t shipyard-build -f Dockerfile.build .
	@rm -f ./controller/controller
	@cd controller && docker run --rm -w /go/src/github.com/shipyard/shipyard --entrypoint /bin/bash shipyard-build -c "make build 1>&2 && cd controller && tar -czf - controller" | tar zxf -

media: media-semantic media-app

media-semantic:
	@cd controller && cp -f public/semantic.theme.config public/semantic/src/theme.config
	@cd controller && cd public/semantic && gulp build
	@cd controller && mkdir -p public/dist
	@cd controller && cd public && rm -rf dist/semantic* dist/themes
	@cd controller && cp -f public/semantic/dist/semantic.min.css public/dist/semantic.min.css
	@cd controller && cp -f public/semantic/dist/semantic.min.js public/dist/semantic.min.js
	@cd controller && mkdir -p public/dist/themes/default && cp -r public/semantic/dist/themes/default/assets public/dist/themes/default/

media-app:
	@cd controller && mkdir -p public/dist
	@cd controller && cd public && rm -rf dist/bundle.js
	@# add frontend ui components here
	@cd controller && cd public/src && browserify app/* -t babelify --outfile ../dist/bundle.js

image: media build
	@echo Building Shipyard image $(TAG)
	@cd controller && docker build -t shipyard/shipyard:$(TAG) .

release: build image
	@docker push shipyard/shipyard:$(TAG)

test: clean 
	@godep go test -v ./...

clean:
	@rm -rf controller/controller
	@rm -rf public/dist/*

.PHONY: all add-deps build dev-setup media media-semantic media-app clean media image test release
