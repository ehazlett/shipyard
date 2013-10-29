#!/bin/bash
APP_DIR=/opt/apps/shipyard
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
NGINX_RESOLVER=${NGINX_RESOLVER:-`cat /etc/resolv.conf | grep nameserver | head -1 | awk '{ print $2; }'`}
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
    git reset --hard
    git checkout --force $REVISION
    git pull --ff-only origin $REVISION
fi
# nginx resolver
cat << EOF >> $APP_DIR/.docker/nginx.conf
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
      proxy_pass http://127.0.0.1:8001;
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
supervisord -c /opt/apps/shipyard/.docker/supervisor.conf -n
