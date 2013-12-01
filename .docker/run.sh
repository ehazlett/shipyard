#!/bin/bash
APP_COMPONENTS="$*"
APP_DIR=/opt/apps/shipyard
ADMIN_PASS=${ADMIN_PASS:-}
CELERY_WORKERS=${CELERY_WORKERS:-4}
REDIS_HOST=${REDIS_HOST:-127.0.0.1}
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
UPDATE_APP=${UPDATE_APP:-}
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
NGINX_RESOLVER=${NGINX_RESOLVER:-`cat /etc/resolv.conf | grep ^nameserver | head -1 | awk '{ print $2; }'`}
SUPERVISOR_CONF=/opt/supervisor.conf

echo "App Components: ${APP_COMPONENTS}"

# if linked, specify db type
if [ ! -z "$DB_PORT_5432_TCP_ADDR" ] ; then
    DB_TYPE=postgresql_psycopg2
    DB_NAME=${DB_ENV_DB_NAME:-shipyard}
    DB_USER=${DB_ENV_DB_USER:-shipyard}
    DB_PASS=${DB_ENV_DB_PASS:-shipyard}
    DB_HOST=${DB_PORT_5432_TCP_ADDR}
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
if [ ! -z "$UPDATE_APP" ] ; then
    git fetch
    git reset --hard
    git checkout --force $REVISION
    git pull --ff-only origin $REVISION
fi
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
directory=/opt/apps/shipyard
command=/usr/local/bin/uwsgi
    --http-socket 0.0.0.0:5000
    -p 4
    -b 32768
    -T
    --master
    --max-requests 5000
    -H /opt/ve/shipyard
    --static-map /static=/opt/apps/shipyard/static
    --static-map /static=/opt/ve/shipyard/lib/python2.7/site-packages/django/contrib/admin/static
    --module wsgi:application
user=root
autostart=true
autorestart=true
stopsignal=QUIT
stdout_logfile=/var/log/shipyard/app.log
stderr_logfile=/var/log/shipyard/app.err

EOF
fi

if [ -z "$APP_COMPONENTS" ] ; then
    cat << EOF >> $SUPERVISOR_CONF
[program:redis]
priority=10
directory=/var/lib/redis
command=redis-server
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/shipyard/redis.log
stderr_logfile=/var/log/shipyard/redis.err

EOF
fi

if [ -z "$APP_COMPONENTS" ] || [ ! -z "`echo $APP_COMPONENTS | grep master-worker`" ] ; then
    cat << EOF >> $SUPERVISOR_CONF
[program:master-worker]
priority=99
directory=/opt/apps/shipyard
command=/opt/ve/shipyard/bin/python manage.py celery worker -B --scheduler=djcelery.schedulers.DatabaseScheduler -E -c ${CELERY_WORKERS}
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
directory=/opt/apps/shipyard
command=/opt/ve/shipyard/bin/python manage.py celery worker --scheduler=djcelery.schedulers.DatabaseScheduler -E -c ${CELERY_WORKERS}
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/shipyard/worker.log
stderr_logfile=/var/log/shipyard/worker.err

EOF
fi

if [ -z "$APP_COMPONENTS" ] ; then
    cat << EOF >> $SUPERVISOR_CONF
[program:nginx]
priority=20
directory=/usr/local/openresty/nginx
command=/usr/local/openresty/nginx/sbin/nginx
    -p /usr/local/openresty/nginx/ 
    -c /opt/apps/shipyard/.docker/nginx.conf
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/shipyard/nginx.log
stderr_logfile=/var/log/shipyard/nginx.err

EOF
fi

if [ -z "$APP_COMPONENTS" ] || [ ! -z "`echo $APP_COMPONENTS | grep router`" ] ; then
    cat << EOF >> $SUPERVISOR_CONF
[program:hipache]
priority=40
directory=/tmp
command=hipache -c /etc/hipache.config.json
user=root
autostart=true
autorestart=true
stdout_logfile=/var/log/shipyard/hipache.log
stderr_logfile=/var/log/shipyard/hipache.err

EOF
fi

# nginx resolver
cat << EOF > $APP_DIR/.docker/nginx.conf
daemon off;
worker_processes  1;
error_log $LOG_DIR/nginx_error.log;

events {
  worker_connections 1024;
}

http {
  server {
    listen 8000;
    access_log $LOG_DIR/nginx_access.log;

    location / {
      proxy_pass http://127.0.0.1:5000;
      proxy_set_header Host \$http_host;
      proxy_set_header X-Forwarded-Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /console/ {
      resolver $NGINX_RESOLVER;

      set \$target '';
      rewrite_by_lua '
        local session_id = " "
        local match, err = ngx.re.match(ngx.var.uri, "(/console/(?<id>.*)/)")
        if match then
            session_id = match["id"]
        else
            if err then
                ngx.log(ngx.ERR, "error: ", err)
                return
            end
            ngx.say("url malformed")
        end

        local key = "console:" .. session_id

        local redis = require "resty.redis"
        local red = redis:new()

        red:set_timeout(1000) -- 1 second

        local ok, err = red:connect("$REDIS_HOST", $REDIS_PORT)
        if not ok then
            ngx.log(ngx.ERR, "failed to connect to redis: ", err)
            return ngx.exit(500)
        end

        local console, err = red:hmget(key, "host", "path")
        if not console then
            ngx.log(ngx.ERR, "failed to get redis key: ", err)
            return ngx.exit(500)
        end

        if console == ngx.null then
            ngx.log(ngx.ERR, "no console session found for key ", key)
            return ngx.exit(400)
        end

        ngx.var.target = console[1]
        
        ngx.req.set_uri(console[2])
      ';
 
      
      proxy_pass http://\$target;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_read_timeout 7200s;
    }
  }
}
EOF
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
if [ ! -z "$ADMIN_PASS" ] ; then
    $VE_DIR/bin/python manage.py update_admin_user --username=admin --password=$ADMIN_PASS
fi
supervisord -c $SUPERVISOR_CONF -n
