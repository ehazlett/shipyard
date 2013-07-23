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
from django.conf import settings
from shipyard import utils
import redis

def update_hipache(app_id=None):
    from applications.models import Application
    if getattr(settings, 'HIPACHE_ENABLED'):
        redis_host = getattr(settings, 'HIPACHE_REDIS_HOST')
        redis_port = getattr(settings, 'HIPACHE_REDIS_PORT')
        rds = redis.Redis(host=redis_host, port=redis_port)
        with rds.pipeline() as pipe:
            app = Application.objects.get(id=app_id)
            domain_key = 'frontend:{0}'.format(app.domain_name)
            # remove existing
            pipe.delete(domain_key)
            pipe.rpush(domain_key, app.id)
            # add upstreams
            for c in app.containers.all():
                port = c.get_ports()[app.backend_port]
                upstream = '{0}://{1}:{2}'.format(app.protocol, c.host.hostname,
                    port)
                pipe.rpush(domain_key, upstream)
            pipe.execute()
            return True
    return False

def remove_hipache_config(domain_name=None):
    if getattr(settings, 'HIPACHE_ENABLED'):
        redis_host = getattr(settings, 'HIPACHE_REDIS_HOST')
        redis_port = getattr(settings, 'HIPACHE_REDIS_PORT')
        rds = redis.Redis(host=redis_host, port=redis_port)
        domain_key = 'frontend:{0}'.format(domain_name)
        # remove existing
        rds.delete(domain_key)

