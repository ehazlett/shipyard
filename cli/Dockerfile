FROM debian:jessie
RUN apt-get update && apt-get install -y ca-certificates rlwrap
ADD cli /usr/local/bin/shipyard
ADD .docker/run.sh /usr/local/bin/run
ADD .docker/preexec.sh /.preexec.sh
ADD .docker/bashrc /.bashrc
CMD ["/bin/bash"]
