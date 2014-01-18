#!/bin/bash
if [ "$1" != "-s" ]; then
    VE_DIR=./.ve
    if [ -e "/etc/lsb-release" ]; then
        DEBCONF_FRONTEND=noninteractive apt-get install -y python-setuptools python-dev
    fi
    easy_install virtualenv
    virtualenv --no-site-packages $VE_DIR
    $VE_DIR/bin/pip install -r requirements.txt
    source $VE_DIR/bin/activate
fi
python manage.py test containers accounts applications hosts images shipyard
