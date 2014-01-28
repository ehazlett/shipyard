# Copyright Evan Hazlett and contributors.
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
import celery
from django.core.cache import cache
from django.conf import settings
from django.utils.translation import ugettext as _
from containers.models import Container
from hosts.models import Host
from exceptions import RecoveryThresholdError
import utils
import hashlib

@celery.task
def import_image(repo_name=None):
    if not repo_name:
        raise StandardError('You must specify a repo name')
    hosts = Host.objects.filter(enabled=True)
    for h in hosts:
        import_image_to_host.subtask((h, repo_name)).apply_async()
    return True

@celery.task
def import_image_to_host(host, repo_name):
    if not host or not repo_name:
        raise StandardError('You must specify a host and repo name')
    print('Importing {} on {}'.format(repo_name, host.name))
    host.import_image(repo_name)
    return 'Imported {} on {}'.format(repo_name, host.name)

@celery.task
def build_image(path=None, tag=None):
    if not path:
        raise StandardError('You must specify a path')
    hosts = Host.objects.filter(enabled=True)
    for h in hosts:
        build_image_on_host.subtask((h, path, tag)).apply_async()
    return True

@celery.task
def build_image_on_host(host, path, tag):
    if not host or not path:
        raise StandardError('You must specify a host and path')
    print('Building {} on {}'.format(tag, host.name))
    host.build_image(path, tag)
    return 'Built {} on {}'.format(tag, host.name)

@celery.task
def docker_host_info():
    hosts = Host.objects.filter(enabled=True)
    for h in hosts:
        get_docker_host_info.subtask((h.id,)).apply_async()
    return True

@celery.task
def recover_containers():
    protected_containers = Container.objects.filter(protected=True).exclude(
            is_running=True)
    for c in protected_containers:
        host = c.host
        print('Recovering {}'.format(c.get_name()))
        c_id, status = host.clone_container(c.container_id)
        # update container info
        host._load_container_data(c_id)
        import time
        time.sleep(5)
        new_c = Container.objects.get(container_id=c_id)
        # update app
        for app in c.get_applications():
            app.containers.remove(c)
            app.containers.add(new_c)
            app.save()

