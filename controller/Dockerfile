FROM alpine:latest
ENV http_proxy=http://web-proxy.il.hpecorp.net:8080 \
    https_proxy=http://web-proxy.il.hpecorp.net:8080 \
    no_proxy=127.0.0.1,localhost,hpeswlab.net,mydyumserver,mydyumserver.hpswlabs.adapps.hp.com,*.hp.com,16.59.0.0,hpswlabs.adapps.hp.com:80

RUN apk add --update git ca-certificates && \
    rm -rf /var/cache/apk/*
ADD static /static
ADD controller /bin/controller
EXPOSE 8080
ENTRYPOINT ["/bin/controller"]
