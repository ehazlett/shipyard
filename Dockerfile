FROM base
MAINTAINER Shipyard Project "http://shipyard-project.com"
RUN apt-get -qq update
RUN apt-get install -y python-dev python-setuptools libxml2-dev libxslt-dev libmysqlclient-dev supervisor redis-server git-core wget make g++ libreadline-dev libncurses5-dev libpcre3-dev 
RUN wget http://nodejs.org/dist/v0.8.26/node-v0.8.26.tar.gz -O /tmp/node.tar.gz
RUN (cd /tmp && tar zxf node.tar.gz && cd node-* && ./configure ; make install)
RUN npm install git+http://github.com/ehazlett/hipache.git -g
ADD .docker/hipache.config.json /etc/hipache.config.json
RUN wget http://openresty.org/download/ngx_openresty-1.4.2.9.tar.gz -O /tmp/nginx.tar.gz
RUN (cd /tmp && tar zxf nginx.tar.gz && cd ngx_* && ./configure --with-luajit && make && make install)
RUN easy_install pip
RUN pip install virtualenv
RUN pip install uwsgi
RUN virtualenv --no-site-packages /opt/ve/shipyard
ADD . /opt/apps/shipyard
ADD .docker/known_hosts /root/.ssh/known_hosts
RUN (find /opt/apps/shipyard -name "*.db" -delete)
RUN (cd /opt/apps/shipyard && git remote rm origin)
RUN (cd /opt/apps/shipyard && git remote add origin https://github.com/ehazlett/shipyard.git)
RUN /opt/ve/shipyard/bin/pip install -r /opt/apps/shipyard/requirements.txt
RUN (cd /opt/apps/shipyard && /opt/ve/shipyard/bin/python manage.py syncdb --noinput)
RUN (cd /opt/apps/shipyard && /opt/ve/shipyard/bin/python manage.py migrate)
RUN (cd /opt/apps/shipyard && /opt/ve/shipyard/bin/python manage.py update_admin_user --username=admin --password=shipyard)

VOLUME /var/log/shipyard
EXPOSE 80
EXPOSE 6379
EXPOSE 8000
CMD ["/bin/sh", "-e", "/opt/apps/shipyard/.docker/run.sh"]
