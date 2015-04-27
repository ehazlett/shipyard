FROM debian:jessie
ADD https://github.com/docker/machine/releases/download/v0.2.0/docker-machine_linux-amd64 /usr/local/bin/docker-machine
RUN chmod +x /usr/local/bin/docker-machine
ADD static /static
ADD controller /bin/controller
EXPOSE 8080
ENTRYPOINT ["/bin/controller"]
