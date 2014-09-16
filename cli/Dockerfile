FROM debian:jessie
ENV GOPATH /gocode
ENV PATH /usr/local/go/bin:$PATH
RUN apt-get update && apt-get install -y ca-certificates curl git-core mercurial
RUN curl -s -L -o /tmp/go.tar.gz https://storage.googleapis.com/golang/go1.3.1.linux-amd64.tar.gz && \
    tar -C /usr/local -xf /tmp/go.tar.gz && rm /tmp/go.tar.gz
ADD . /gocode/src/app
RUN go get app
WORKDIR /gocode/src/app
RUN ln -s /gocode/src/app/cli /usr/local/bin/shipyard
ENV PROG shipyard
ADD .docker/autocomplete /.autocomplete
ADD .docker/bashrc /.bashrc
RUN /usr/local/bin/shipyard --generate-bash-completion > /etc/bash_completion.d/shipyard
CMD ["/bin/bash"]
