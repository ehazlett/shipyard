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
import celery
from containers.models import Container
import utils

@celery.task
def check_protected_containers():
    print('Checking protected containers...')
    protected_containers = Container.objects.filter(protected=True)
    for c in protected_containers:
        # get host containers
        cnt_ids = [utils.get_short_id(x.get('Id'))
            for x in c.host.get_containers()]
        # check if container is still running
        if c.container_id not in cnt_ids:
            print('Recovering: {}'.format(c.description))
            host = c.host
            meta = c.get_meta()
            cfg = meta.get('Config')
            image = cfg.get('Image')
            command = ' '.join(cfg.get('Cmd'))
            # TODO: update port spec to specify the NAT'd port
            # to maintain connectivity
            ports = cfg.get('PortSpecs')
            env = cfg.get('Env')
            mem = cfg.get('Memory')
            description = c.description
            volumes = cfg.get('Volumes')
            volumes_from = cfg.get('VolumesFrom')
            privileged = cfg.get('Privileged')
            owner = c.owner
            c_id, status = host.create_container(image, command, ports, env, mem, description,
                volumes, volumes_from, privileged, owner)
            new_c = Container.objects.get(container_id=c_id)
            # mark new container as protected
            new_c.protected = True
            new_c.save()
            # TODO: add new container to any applications that
            # previous container belonged to

            # remove old container meta
            c.delete()
    return True

