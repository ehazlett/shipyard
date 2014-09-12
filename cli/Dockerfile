FROM debian:jessie
RUN apt-get update && apt-get install -y ca-certificates rlwrap
ENV PROG shipyard
ADD cli /usr/local/bin/shipyard
ADD .docker/autocomplete /.autocomplete
ADD .docker/bashrc /.bashrc
RUN shipyard --generate-bash-completion > /etc/bash_completion.d/shipyard
CMD ["/bin/bash"]
