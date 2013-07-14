#!/bin/sh
VE_DIR=./.ve
easy_install virtualenv
virtualenv --no-site-packages $VE_DIR
$VE_DIR/bin/pip install -r requirements.txt
python manage.py test accounts applications containers dashboard shipyard
rm -rf $VE_DIR
