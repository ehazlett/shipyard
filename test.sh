#!/bin/sh
VE_DIR=./.ve
if [ -e "/etc/lsb-release" ]; then
    DEBCONF_FRONTEND=noninteractive apt-get install -y python-setuptools python-dev
fi
easy_install virtualenv
virtualenv --no-site-packages $VE_DIR
$VE_DIR/bin/pip install -r requirements.txt
$VE_DIR/bin/python manage.py test accounts applications containers dashboard shipyard
