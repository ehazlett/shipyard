FROM debian:jessie
ADD . /app
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["/app/controller"]
CMD ["-h"]
