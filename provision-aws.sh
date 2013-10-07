#!/bin/bash

APP_DIR=/opt/apps
VE_ROOT=/opt/ve
VE_DIR=$VE_ROOT/shipyard
GIT_RECEIVER_URL='https://raw.github.com/ehazlett/gitreceive/master/gitreceive'

if [ -e "/etc/.provisioned" ] ; then
    echo "VM already provisioned.  Remove /etc/.provisioned to force"
    exit 0
fi

apt-get -qq update
DEBIAN_FRONTEND=noninteractive apt-get -qq install -y build-essential python-software-properties s3cmd git-core linux-image-extra-`uname -r` bridge-utils bsdtar lxc wget ruby python-dev libxml2-dev python-setuptools redis-server supervisor

# Install Node.js
# from https://chrislea.com/2013/03/15/upgrading-from-node-js-0-8-x-to-0-10-0-from-my-ppa/
echo deb http://ppa.launchpad.net/chris-lea/node.js/ubuntu raring main > /etc/apt/sources.list.d/nodejs.list
echo deb-src http://ppa.launchpad.net/chris-lea/node.js/ubuntu raring main >> /etc/apt/sources.list.d/nodejs.list

# Add the Docker sources
echo deb https://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list
apt-get -qq update

echo "Install docker and nodejs"
DEBIAN_FRONTEND=noninteractive apt-get -qq install -y --force-yes lxc-docker nodejs

echo "Edit docker upstart to listen on tcp"
sed -i 's/\/usr\/bin\/docker.*/\/usr\/bin\/docker -d -H tcp:\/\/0.0.0.0:4243 -H unix:\/\/\/var\/run\/docker\.sock/g' /etc/init/docker.conf
service docker restart

mkdir -p $VE_ROOT

easy_install pip
pip install virtualenv uwsgi

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
chown -R ubuntu $VE_DIR

# bashrc
UBUNTU_BASHRC=/home/ubuntu/.bashrc
if [ "`grep \"source /opt/ve\" $UBUNTU_BASHRC`" = "" ]; then
    echo "source $VE_DIR/bin/activate" >> $UBUNTU_BASHRC
    echo "alias pm='python manage.py \$*'" >> $UBUNTU_BASHRC
    echo "alias pmr='python manage.py runserver 0.0.0.0:8000\$*'" >> $UBUNTU_BASHRC
    echo "alias pmq='python manage.py celery worker -B --scheduler=djcelery.schedulers.DatabaseScheduler -E\$*'" >> $UBUNTU_BASHRC
    echo "echo ''" >> $UBUNTU_BASHRC
    echo "cd $APP_DIR" >> $UBUNTU_BASHRC
fi

# install go
if [ ! -e "/usr/local/go" ] ; then
    wget -O /tmp/go.tar.gz http://go.googlecode.com/files/go1.1.2.linux-amd64.tar.gz
    cd /usr/local ;  tar xzf /tmp/go.tar.gz
    rm -rf /tmp/go.tar.gz
fi

cat << EOF > /etc/environment
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/local/go/bin"
EOF

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
