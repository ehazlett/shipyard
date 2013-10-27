#!/bin/bash
APP_DIR=/opt/apps/shipyard
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
CONFIG=$APP_DIR/shipyard/local_settings.py
SKIP_DEPLOY=${SKIP_DEPLOY:-}
REVISION=${REVISION:-master}
LOG_DIR=/var/log/shipyard
HIPACHE_CONFIG=/etc/hipache.config.json
HIPACHE_WORKERS=${HIPACHE_WORKERS:-5}
HIPACHE_MAX_SOCKETS=${HIPACHE_MAX_SOCKETS:-100}
HIPACHE_DEAD_BACKEND_TTL=${HIPACHE_DEAD_BACKEND_TTL:-30}
HIPACHE_HTTP_PORT=${HIPACHE_HTTP_PORT:-80}
HIPACHE_HTTPS_PORT=${HIPACHE_HTTPS_PORT:-443}
HIPACHE_SSL_CERT=${HIPACHE_SSL_CERT:-}
HIPACHE_SSL_KEY=${HIPACHE_SSL_KEY:-}
NGINX_RESOLVER=${NGINX_RESOLVER:-}
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
EOF
# hipache config
cat << EOF > $HIPACHE_CONFIG
{
    "server": {
        "accessLog": "/var/log/shipyard/hipache.log",
        "port": $HIPACHE_HTTP_PORT,
        "workers": $HIPACHE_WORKERS,
        "maxSockets": $HIPACHE_MAX_SOCKETS,
EOF
# hipache ssl support
if [ ! -z "$HIPACHE_SSL_CERT" ] ; then
    cat << EOF >> $HIPACHE_CONFIG
        "https": {
            "port": $HIPACHE_HTTPS_PORT,
            "key": "$HIPACHE_SSL_KEY",
            "cert": "$HIPACHE_SSL_CERT"
        },
EOF
fi
cat << EOF >> $HIPACHE_CONFIG
        "deadBackendTTL": $HIPACHE_DEAD_BACKEND_TTL
    },
    "redisHost": "$REDIS_HOST",
    "redisPort": $REDIS_PORT
}
EOF

# deploy
if [ -z "$SKIP_DEPLOY" ] ; then
    git fetch
    git reset --HARD
    git checkout --force $REVISION
    git pull --ff-only origin $REVISION
fi
# nginx resolver
if [ ! -z "$NGINX_RESOLVER" ] ; then
    sed -i 's/resolver*/resolver $NGINX_RESOLVER;/g' $APP_DIR/.docker/nginx.conf

EOF
fi
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
