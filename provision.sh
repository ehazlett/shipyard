#!/bin/bash

APP_DIR=/opt/app
VE_ROOT=/opt/ve
VE_DIR=$VE_ROOT/shipyard
NODE_URL='http://nodejs.org/dist/v0.10.12/node-v0.10.12.tar.gz'
GIT_RECEIVER_URL='https://raw.github.com/ehazlett/gitreceive/master/gitreceive'

apt-get -qq update
DEBCONF_FRONTEND=noninteractive apt-get -qq install -y python-software-properties s3cmd git-core linux-image-extra-`uname -r` bridge-utils bsdtar lxc wget ruby python-dev libxml2-dev python-setuptools redis-server

mkdir -p $VE_ROOT

easy_install pip
pip install virtualenv

# install hipache
if [ ! -e "/usr/local/bin/node" ] ; then
    cd /tmp
    wget $NODE_URL -O nodejs.tar.gz
    tar zxf nodejs.tar.gz
    cd node-*
    ./configure ; make ; make install
fi

npm install git+http://github.com/ehazlett/hipache.git -g

cat << EOF > /etc/hipache.config.json
{
    "server": {
        "accessLog": "/var/log/hipache_access.log",
        "port": 80,
        "workers": 5,
        "maxSockets": 100,
        "deadBackendTTL": 30
    },
    "redisHost": "127.0.0.1",
    "redisPort": 6379
}
EOF

# install go & docker
if [ ! -e "/usr/local/bin/docker" ] ; then
    cd /tmp
    wget https://go.googlecode.com/files/go1.1.1.linux-amd64.tar.gz -O go.tar.gz
    cd /opt ; tar zxf /tmp/go.tar.gz
    grep -v go /etc/environment && echo \'PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/opt/go/bin"\' > /etc/environment
    PATH=$PATH:/opt/go/bin
    if [ -e docker ]; then rm -rf docker; fi ; git clone https://github.com/dotcloud/docker
    cd docker ; git checkout master; GOROOT=/opt/go make
    killall docker
    cp -f bin/docker /usr/local/bin/docker
fi
# install gitreceiver
cd /tmp
wget $GIT_RECEIVER_URL -O /usr/local/bin/gitreceive --no-check-certificate
chmod +x /usr/local/bin/gitreceive
if [ ! -e "/home/git" ]; then
    /usr/local/bin/gitreceive init
fi

# app
virtualenv --no-site-packages $VE_DIR

cd $APP_DIR
$VE_DIR/bin/pip install -r requirements.txt
chown -R vagrant $VE_DIR

# bashrc
if [ "`grep \"source /opt/ve\" /home/vagrant/.bashrc`" = "" ]; then
    echo "source $VE_DIR/bin/activate" >> /home/vagrant/.bashrc
    echo "cd $APP_DIR" >> /home/vagrant/.bashrc
fi

cat << EOF > /etc/supervisor/conf.d/shipyard.conf
[program:shipyard-lb]
directory=/tmp
command=hipache -c /etc/hipache.config.json
user=root
autostart=true
autorestart=true

[program:docker]
directory=/tmp
command=/usr/local/bin/docker -r -d -H 0.0.0.0:4243
user=root
autostart=true
autorestart=true

EOF

supervisorctl update

