#!/bin/bash
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
DB_TYPE=${DB_TYPE:-sqlite3}
DB_NAME=${DB_NAME:-shipyard.db}
DB_USER=${DB_USER:-}
DB_PASS=${DB_PASS:-}
DB_HOST=${DB_HOST:-}
DB_PORT=${DB_PORT:-}
CONFIG=/opt/apps/shipyard/shipyard/local_settings.py
cd /opt/apps/shipyard
echo "REDIS_HOST=\"$REDIS_HOST\"" > $CONFIG
echo "REDIS_PORT=$REDIS_PORT" >> $CONFIG
cat << EOF >> $CONFIG
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.${DB_TYPE}',
        'NAME': '${DB_NAME}',
        'USER': '${DB_USER}',
        'PASSWORD': '${DB_PASS}',
        'HOST': '${DB_HOST}',
        'PORT': '${DB_PORT}',
    }
}
EOF
git pull origin master
/opt/ve/shipyard/bin/pip install -r requirements.txt
/opt/ve/shipyard/bin/python manage.py syncdb --noinput
/opt/ve/shipyard/bin/python manage.py migrate --noinput
supervisord -c /opt/supervisor.conf -n
