# Copyright 2013 Evan Hazlett and contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# Django settings for shipyard project.
import os
import subprocess
from datetime import timedelta
from django.contrib.messages import constants as messages
PROJECT_ROOT = os.path.join(os.path.dirname(__file__), '../')

DEBUG = True
TEMPLATE_DEBUG = DEBUG
APP_NAME = 'shipyard'
# app rev
p = subprocess.Popen(['git', 'rev-parse', 'HEAD'], stdout=subprocess.PIPE)
out, err = p.communicate()
APP_REVISION = out[:6]
GOOGLE_ANALYTICS_CODE = os.environ.get('GOOGLE_ANALYTICS_CODE', None)

ADMINS = (
    #('Admin', 'admin@local.net'),
)

AUTH_PROFILE_MODULE = 'accounts.UserProfile'

MANAGERS = ADMINS

# cache settings
HOST_CACHE_TTL = 30 # seconds to cache container lookup

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'shipyard.db',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}
CACHES = {
    "default": {
        "BACKEND": "redis_cache.cache.RedisCache",
        "LOCATION": "127.0.0.1:6379:0",
        "OPTIONS": {
            "CLIENT_CLASS": "redis_cache.client.DefaultClient",
        }
    }
}
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = os.getenv('REDIS_DB', 0)
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = []

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/New_York'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = 'static_root'

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    os.path.join(PROJECT_ROOT, 'static'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'd%iskx#4q%jky6@j!8jk*u)9=2b7mmyz5_8(2i895ulbpk+8ou'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'shipyard.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'shipyard.wsgi.application'

TEMPLATE_DIRS = (
    os.path.join(PROJECT_ROOT, 'templates'),
)
TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.request",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "shipyard.context_processors.app_name",
    "shipyard.context_processors.app_revision",
    "shipyard.context_processors.google_analytics_code",
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'south',
    'djcelery',
    'crispy_forms',
    'shipyard',
    'accounts',
    'applications',
    'containers',
    'images',
    'hosts',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

CRISPY_TEMPLATE_PACK = 'bootstrap3'
MESSAGE_TAGS = {
    messages.ERROR: 'danger',
}

# amount of time in seconds to check protected containers
RECOVERY_INTERVAL = 15
# number of times to restart a container before aborting
RECOVYER_THRESHOLD = 3

try:
    from local_settings import *
except ImportError:
    pass

# enable the hipache load balancer integration (needed for applications)
HIPACHE_ENABLED = True
HIPACHE_REDIS_HOST = REDIS_HOST
HIPACHE_REDIS_PORT = REDIS_PORT
BROKER_URL = 'redis://'
if REDIS_PASSWORD:
    BROKER_URL += ':{}@'.format(REDIS_PASSWORD)
BROKER_URL += '{}:{}/{}'.format(REDIS_HOST, REDIS_PORT, REDIS_DB)
CELERY_TIMEZONE = 'UTC'

# celery scheduled tasks
CELERYBEAT_SCHEDULE = {
    'check-protected-containers': {
        'task': 'shipyard.tasks.check_protected_containers',
        'schedule': timedelta(seconds=RECOVERY_INTERVAL),
    }
}

import djcelery
djcelery.setup_loader()
