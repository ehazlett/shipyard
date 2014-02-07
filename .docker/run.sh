#!/bin/bash
APP_COMPONENTS="$*"
APP_DIR=/app
ADMIN_PASS=${ADMIN_PASS:-}
DEBUG=${DEBUG:-True}
CELERY_WORKERS=${CELERY_WORKERS:-4}
DB_TYPE=${DB_TYPE:-sqlite3}
DB_NAME=${DB_NAME:-shipyard.db}
DB_USER=${DB_USER:-}
DB_PASS=${DB_PASS:-}
DB_HOST=${DB_HOST:-}
DB_PORT=${DB_PORT:-}
EXTRA_CMD=${EXTRA_CMD:-}
EXTRA_REQUIREMENTS=${EXTRA_REQUIREMENTS:-}
CONFIG=$APP_DIR/shipyard/local_settings.py
LOG_DIR=/var/log/shipyard
SUPERVISOR_CONF=/opt/supervisor.conf
REDIS_HOST="${REDIS_PORT_6379_TCP_ADDR:-$REDIS_HOST}"
REDIS_PORT=${REDIS_PORT_6379_TCP_PORT:-$REDIS_PORT}

echo "App Components: ${APP_COMPONENTS}"

# check for db link
if [ ! -z "$DB_PORT_5432_TCP_ADDR" ] ; then
    DB_TYPE=postgresql_psycopg2
    DB_NAME="${DB_ENV_DB_NAME:-shipyard}"
    DB_USER="${DB_ENV_DB_USER:-shipyard}"
    DB_PASS="${DB_ENV_DB_PASS:-shipyard}"
    DB_HOST="${DB_PORT_5432_TCP_ADDR}"
    DB_PORT=${DB_PORT_5432_TCP_PORT}
fi
mkdir -p $LOG_DIR
cd $APP_DIR
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
DEBUG = ${DEBUG}
EOF

# supervisor
cat << EOF > $SUPERVISOR_CONF
[supervisord]
nodaemon=false

[unix_http_server]
file=/var/run//supervisor.sock
chmod=0700

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///var/run//supervisor.sock

EOF

if [ -z "$APP_COMPONENTS" ] || [ ! -z "`echo $APP_COMPONENTS | grep app`" ] ; then
    cat << EOF >> $SUPERVISOR_CONF
[program:app]
priority=10
directory=/app
command=/usr/local/bin/uwsgi
    --http-socket 0.0.0.0:8000
    -p 4
    -b 32768
    -T
    --master
    --max-requests 5000
    --static-map /static=/app/static
    --static-map /static=/usr/local/lib/python2.7/dist-packages/django/contrib/admin/static
    --module wsgi:application
user=root
autostart=true
autorestart=true
stopsignal=QUIT
stdout_logfile=/var/log/shipyard/app.log
stderr_logfile=/var/log/shipyard/app.err

EOF
fi

if [ -z "$APP_COMPONENTS" ] || [ ! -z "`echo $APP_COMPONENTS | grep master-worker`" ] ; then
    cat << EOF >> $SUPERVISOR_CONF
[program:master-worker]
priority=99
directory=/app
command=python manage.py celery worker -B --scheduler=djcelery.schedulers.DatabaseScheduler -E -c ${CELERY_WORKERS}
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/shipyard/master-worker.log
stderr_logfile=/var/log/shipyard/master-worker.err

EOF
fi

if [ ! -z "`echo $APP_COMPONENTS | grep "^worker"`" ] ; then
    cat << EOF >> $SUPERVISOR_CONF
[program:worker]
priority=99
directory=/app
command=python manage.py celery worker --scheduler=djcelery.schedulers.DatabaseScheduler -E -c ${CELERY_WORKERS}
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/shipyard/worker.log
stderr_logfile=/var/log/shipyard/worker.err

EOF
fi

if [ ! -z "$EXTRA_CMD" ]; then
    /bin/bash -c "$EXTRA_CMD"
fi
pip install -r requirements.txt
if [ ! -z "$EXTRA_REQUIREMENTS" ]; then
    pip install $EXTRA_REQUIREMENTS
fi
python manage.py syncdb --noinput
python manage.py migrate --noinput
python manage.py create_api_keys
if [ ! -z "$ADMIN_PASS" ] ; then
    python manage.py update_admin_user --username=admin --password=$ADMIN_PASS
fi
supervisord -c $SUPERVISOR_CONF -n
