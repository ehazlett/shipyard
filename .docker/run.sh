#!/bin/bash
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
DB_TYPE=${DB_TYPE:-sqlite3}
DB_NAME=${DB_NAME:-shipyard.db}
DB_USER=${DB_USER:-}
DB_PASS=${DB_PASS:-}
DB_HOST=${DB_HOST:-}
DB_PORT=${DB_PORT:-}
VE_DIR=/opt/ve/shipyard
EXTRA_CMD=${EXTRA_CMD:-}
EXTRA_REQUIREMENTS=${EXTRA_REQUIREMENTS:-}
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
git pull origin master --rebase
if [ ! -z "$EXTRA_CMD" ]; then
    /bin/bash -c "$EXTRA_CMD"
fi
$VE_DIR/bin/pip install -r requirements.txt
if [ ! -z "$EXTRA_REQUIREMENTS" ]; then
    $VE_DIR/bin/pip install $EXTRA_REQUIREMENTS
fi
$VE_DIR/bin/python manage.py syncdb --noinput
$VE_DIR/bin/python manage.py migrate --noinput
$VE_DIR/bin/python manage.py create_api_keys
supervisord -c /opt/apps/shipyard/.docker/supervisor.conf -n
