from ubuntu:12.04
maintainer Shipyard Project "http://shipyard-project.com"
run echo "deb http://us.archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
run apt-get update
run apt-get install -y python-dev python-setuptools libxml2-dev libxslt-dev libmysqlclient-dev supervisor redis-server git-core wget make g++ libreadline-dev libncurses5-dev libpcre3-dev  libpq-dev libmysqlclient-dev
run wget http://nodejs.org/dist/v0.8.26/node-v0.8.26.tar.gz -O /tmp/node.tar.gz
run (cd /tmp && tar zxf node.tar.gz && cd node-* && ./configure ; make install)
run npm install git+http://github.com/ehazlett/hipache.git -g
run wget http://openresty.org/download/ngx_openresty-1.4.2.9.tar.gz -O /tmp/nginx.tar.gz
run (cd /tmp && tar zxf nginx.tar.gz && cd ngx_* && ./configure --with-luajit && make && make install)
env SHIPYARD_APP_DIR /opt/apps/shipyard
env SHIPYARD_VE_DIR /opt/ve/shipyard
run easy_install pip
run pip install virtualenv
run pip install uwsgi
run virtualenv --no-site-packages $SHIPYARD_VE_DIR
run $SHIPYARD_VE_DIR/bin/pip install MySQL-Python==1.2.3
run $SHIPYARD_VE_DIR/bin/pip install psycopg2
add . $SHIPYARD_APP_DIR
add .docker/known_hosts /root/.ssh/known_hosts
run (find $SHIPYARD_APP_DIR -name "*.db" -delete)
run (cd $SHIPYARD_APP_DIR && git remote rm origin)
run (cd $SHIPYARD_APP_DIR && git remote add origin https://github.com/shipyard/shipyard.git)
run $SHIPYARD_VE_DIR/bin/pip install -r $SHIPYARD_APP_DIR/requirements.txt
run (cd $SHIPYARD_APP_DIR && $SHIPYARD_VE_DIR/bin/python manage.py syncdb --noinput)
run (cd $SHIPYARD_APP_DIR && $SHIPYARD_VE_DIR/bin/python manage.py migrate)
run (cd $SHIPYARD_APP_DIR && $SHIPYARD_VE_DIR/bin/python manage.py update_admin_user --username=admin --password=shipyard)

volume /var/log/shipyard
expose 80
expose 443
expose 6379
expose 8000
workdir /opt/apps/shipyard
entrypoint ["/opt/apps/shipyard/.docker/run.sh"]
