FROM debian:jessie
RUN apt-get update && apt-get install -y ca-certificates rlwrap
ADD cli /usr/local/bin/shipyard-cli
ADD run.sh /usr/local/bin/run
ENTRYPOINT ["rlwrap", "/usr/local/bin/run"]
CMD []
