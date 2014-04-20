from stackbrew/ubuntu:12.04
maintainer Shipyard Project "http://shipyard-project.com"
run apt-get update
run apt-get install -y python-dev python-setuptools libxml2-dev libxslt-dev libmysqlclient-dev supervisor wget make g++ libreadline-dev libncurses5-dev libpcre3-dev libpq-dev libmysqlclient-dev git-core
env SHIPYARD_APP_DIR /app
run easy_install pip
run pip install setuptools --no-use-wheel --upgrade
run pip install uwsgi==2.0.2
run pip install MySQL-Python==1.2.3
run pip install psycopg2
add . $SHIPYARD_APP_DIR
add .docker/known_hosts /root/.ssh/known_hosts
run (find $SHIPYARD_APP_DIR -name "*.db" -delete)
run pip install --upgrade -r $SHIPYARD_APP_DIR/requirements.txt
run (cd $SHIPYARD_APP_DIR && python manage.py syncdb --noinput)
run (cd $SHIPYARD_APP_DIR && python manage.py migrate)
run (cd $SHIPYARD_APP_DIR && python manage.py update_admin_user --username=admin --password=shipyard)

volume /var/log/shipyard
expose 8000
workdir /app
cmd ["/app/.docker/run.sh"]
