#!/bin/bash
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
cd /opt/apps/shipyard
git pull origin master
/opt/ve/shipyard/bin/pip install -r requirements.txt
/opt/ve/shipyard/bin/python manage.py syncdb --noinput
/opt/ve/shipyard/bin/python manage.py migrate --noinput
echo "REDIS_HOST=\"$REDIS_HOST\"" > /opt/apps/shipyard/shipyard/local_settings.py
echo "REDIS_PORT=$REDIS_PORT" >> /opt/apps/shipyard/shipyard/local_settings.py
supervisord -c /opt/supervisor.conf -n
