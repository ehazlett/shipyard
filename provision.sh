#!/bin/bash

APP_DIR=/opt/app
VE_ROOT=/opt/ve
VE_DIR=$VE_ROOT/shipyard
NODE_URL='http://nodejs.org/dist/v0.10.12/node-v0.10.12.tar.gz'
GIT_RECEIVER_URL='https://raw.github.com/ehazlett/gitreceive/master/gitreceive'

if [ -e "/etc/.provisioned" ] ; then
    echo "VM already provisioned.  Remove /etc/.provisioned to force"
    exit 0
fi

apt-get -qq update
DEBIAN_FRONTEND=noninteractive apt-get -qq install -y python-software-properties s3cmd git-core linux-image-extra-`uname -r` bridge-utils bsdtar lxc wget ruby python-dev libxml2-dev python-setuptools redis-server supervisor
echo deb https://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list
apt-get -qq update
DEBIAN_FRONTEND=noninteractive apt-get install -y --force-yes lxc-docker
# edit docker upstart to listen on tcp
sed -i 's/\/usr\/bin\/docker.*/\/usr\/bin\/docker -d -H tcp:\/\/0.0.0.0:4243/g' /etc/init/docker.conf
service docker restart

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
VAGRANT_BASHRC=/home/vagrant/.bashrc
if [ "`grep \"source /opt/ve\" $VAGRANT_BASHRC`" = "" ]; then
    echo "source $VE_DIR/bin/activate" >> $VAGRANT_BASHRC
    echo "alias pm='python manage.py \$*'" >> $VAGRANT_BASHRC
    echo "alias pmr='python manage.py runserver 0.0.0.0:8000\$*'" >> $VAGRANT_BASHRC
    echo "alias pmq='python manage.py rqworker shipyard\$*'" >> $VAGRANT_BASHRC
    echo "echo ''" >> $VAGRANT_BASHRC
    echo "cd $APP_DIR" >> $VAGRANT_BASHRC
fi

cat << EOF > /etc/supervisor/conf.d/shipyard.conf
[program:hipache]
directory=/tmp
command=hipache -c /etc/hipache.config.json
user=root
autostart=true
autorestart=true

EOF

supervisorctl update

touch /etc/.provisioned
