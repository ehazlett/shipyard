FROM debian:jessie
ENV GOPATH /gocode
ENV PATH /usr/local/go/bin:$PATH
RUN apt-get update && \
    apt-get install -y apt-transport-https curl git-core mercurial
RUN curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
RUN echo 'deb https://deb.nodesource.com/node jessie main' > /etc/apt/sources.list.d/nodesource.list
RUN echo 'deb-src https://deb.nodesource.com/node jessie main' >> /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y nodejs
RUN curl -s -L -o /tmp/go.tar.gz https://storage.googleapis.com/golang/go1.3.1.linux-amd64.tar.gz && \
    tar -C /usr/local -xf /tmp/go.tar.gz && rm /tmp/go.tar.gz
ADD . /gocode/src/app
RUN go get app
WORKDIR /gocode/src/app
EXPOSE 8080
ENTRYPOINT ["/gocode/src/app/controller"]
CMD []
