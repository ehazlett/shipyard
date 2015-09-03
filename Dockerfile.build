FROM golang:1.5

RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get update && apt-get install -y nodejs
RUN npm install -g bower
RUN go get github.com/tools/godep

ADD https://get.docker.com/builds/Linux/x86_64/docker-1.7.0 /usr/local/bin/docker
RUN chmod +x /usr/local/bin/docker
ENV TAG latest
ENV PATH $PATH:/go/bin:/usr/local/go/bin

COPY . /go/src/github.com/shipyard/shipyard

WORKDIR /go/src/github.com/shipyard/shipyard
