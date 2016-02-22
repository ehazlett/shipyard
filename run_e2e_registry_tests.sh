#!/bin/bash
# Executes Shipyard e2e tests that require registry integration.
# Registries tested:
#   (1) registry:2
#   (2) JFrog artifactory
# Please refer to the docker-compose.yml and docker-compose-silent.yml for Shipyard container configuration.
# For configurations for the registries please revise this script.
#
 docker build -t shipyard_test -f Dockerfile.test .
 here=`pwd`
 docker-compose -f docker-compose.yml -f docker-compose-silent.yml up &
 echo "Starting registry v2"
 docker pull registry:2
 docker run -d -p 6000:5000 --name="shipyard_registry_v2" \
        -e REGISTRY_AUTH=htpasswd \
        -e REGISTRY_AUTH_HTPASSWD_REALM="Registry Realm" \
        -e REGISTRY_AUTH_HTPASSWD_PATH=/htpasswd \
        -e REGISTRY_HTTP_TLS_CERTIFICATE=/domain.crt \
        -e REGISTRY_HTTP_TLS_KEY=/domain.key \
        --entrypoint /bin/bash \
        registry:2 \
        -c "printf 'AU\nname\ncity\ncompany\nsection\nfqdn\naddress\n' | openssl req -newkey rsa:4096 -nodes -sha256 -keyout /domain.key -x509 -days 365 -out /domain.crt; htpasswd -Bbn testuser testpassword > /htpasswd; /bin/registry /etc/docker/registry/config.yml"

 echo "Starting registry v2 test container"
 docker run -it --name="shipyard_test" \
            -v $here:/go/src/github.com/shipyard/shipyard \
            -v /var/run/docker.sock:/var/run/docker.sock \
            --entrypoint="/bin/bash" \
            shipyard_test \
            -c "export REGPORT=6000 && export REGUSER=testuser && export REGPASS=testpassword && make build && godep go test -v ./test-assets"

echo "Tearing down registry v2 container"
docker rm -f shipyard_registry_v2
docker rm -f shipyard_test

echo "-------------------------------------------------------------------------"
echo "Starting artifactory"
docker run -d --name="shipyard_artifactory" \
          -p 81:80 \
          -p 8081:8081 \
          -p 444:443 \
          -p 5001-5002:5001-5002 \
          -v $here/test-assets/artifactory/default.conf:/etc/nginx/conf.d/default.conf \
          -v $here/test-assets/artifactory/artifactory.lic:/var/opt/jfrog/artifactory/etc/artifactory.lic \
          -v $here/test-assets/artifactory/artifactory.config.xml:/var/opt/jfrog/artifactory/etc/artifactory.config \
          jfrog-docker-reg2.bintray.io/jfrog/artifactory-registry:latest

echo "Starting artifactory test container"
docker pull jfrog-docker-reg2.bintray.io/jfrog/artifactory-registry:latest
docker run -it --name="shipyard_test" \
            -v $here:/go/src/github.com/shipyard/shipyard \
            -v /var/run/docker.sock:/var/run/docker.sock \
            --entrypoint="/bin/bash" \
            shipyard_test \
            -c "export REGPORT=5002 && export REGUSER=admin && export REGPASS=password && godep go test -v ./test-assets"

echo "Done with tests, tearing it all down"
docker rm -f shipyard_artifactory
docker rm -f shipyard_test
docker-compose -f docker-compose.yml -f docker-compose-silent.yml stop
docker-compose -f docker-compose.yml -f docker-compose-silent.yml rm -f
docker rmi shipyard_test
echo "-------------------------------------------------------------------------"