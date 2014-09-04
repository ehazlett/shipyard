FROM debian:jessie
RUN apt-get update && apt-get install -y ca-certificates
ADD cli /usr/local/bin/shipyard-cli
ADD run.sh /usr/local/bin/run
ENTRYPOINT ["/usr/local/bin/run"]
CMD []
