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
from fabric.api import sudo, run, cd, env, execute, put
import fabric.state
from fabric.decorators import task, with_settings
from fabric.context_managers import settings, hide
from random import Random
import os
import string
import sys
import json
import time
fabric.state.output['running'] = False
env.output_prefix = False

def check_docker(*args, **kwargs):
    with settings(warn_only=True), hide('stdout', 'running', 'warnings'):
        out = run('which docker')
        if out == '':
            install_docker()

def check_valid_os(*args, **kwargs):
    with settings(warn_only=True), hide('stdout', 'running', 'warnings'):
        out = run('which apt-get')
        if out == '':
            raise StandardError('Only Debian/Ubuntu are supported.  Sorry.')

def get_local_ip():
    return run("ifconfig eth0 | grep 'inet addr:' | cut -d':' -f2 | awk '{ print $1; }'")

@task
def install_docker():
    check_valid_os()
    print(':: Installing Docker')
    ver = run('cat /etc/lsb-release  | grep DISTRIB_RELEASE | cut -d \'=\' -f2')
    reboot_needed = False
    sudo('apt-get update')
    if ver == '12.04':
        sudo('apt-get install -y linux-image-generic-lts-raring linux-headers-generic-lts-raring')
        sudo('sudo sh -c "wget -qO- https://get.docker.io/gpg | apt-key add -"')
        sudo('sh -c "echo deb http://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list"')
        print('* You will need to reboot in order to use the new kernel and aufs module') 
        reboot_needed = True
    else:
        sudo('apt-get install -y linux-image-extra-`uname -r`')
        sudo('sudo sh -c "wget -qO- https://get.docker.io/gpg | apt-key add -"')
        sudo('sh -c "echo deb http://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list"')
    sudo('apt-get update')
    sudo('apt-get install -y lxc-docker git-core')
    sudo('echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf ; sysctl -p /etc/sysctl.conf')
    # check ufw
    sudo("sed -i 's/^DEFAULT_FORWARD_POLICY.*/DEFAULT_FORWARD_POLICY=\"ACCEPT\"/g' /etc/default/ufw")
    sudo('service ufw restart')
    # set to listen on local addr
    local_ip = get_local_ip()
    with open('.tmpcfg', 'w') as f:
        f.write('DOCKER_OPTS="-H unix:///var/run/docker.sock -H tcp://{}:4243"'.format(local_ip))
    put('.tmpcfg', '/etc/default/docker', use_sudo=True)
    os.remove('.tmpcfg')
    sudo('service docker restart')
    if reboot_needed:
        print('Setup complete.  Rebooting...')
        sudo('reboot')

@task
def setup_redis():
    check_valid_os()
    check_docker()
    print(':: Setting up Shipyard Redis')
    with hide('stdout', 'warnings'):
        build = True
        with settings(warn_only=True):
            out = sudo('docker ps | grep shipyard_redis')
            build = out.return_code
        if build:
            sudo('docker pull shipyard/redis')
            sudo('docker run -i -t -d -p 6379:6379 -name shipyard_redis shipyard/redis')

@task
def setup_app_router(redis_host=None):
    if not redis_host:
        print('You must specify the hostname/IP from the shipyard/redis container host')
        sys.exit(1)
    check_valid_os()
    check_docker()
    print(':: Setting up Shipyard Router')
    with hide('stdout', 'warnings'):
        build = True
        with settings(warn_only=True):
            out = sudo('docker ps | grep shipyard/router')
            build = out.return_code
        if build:
            sudo('docker pull shipyard/router')
            c_id = sudo('docker run -i -t -d -p 80 -e REDIS_HOST={} shipyard/router'.format(redis_host))
        else:
            c_id = sudo("docker ps | grep shipyard/router | tail -1 | awk '{ print $1; }'")
        port_map = sudo('docker port {} 80'.format(c_id))
        port = port_map.split(':')[-1]
        print('-  Shipyard Router started')
    return '{}:{}'.format(env.host_string, port)

@task
def setup_load_balancer(redis_host=None, upstreams=''):
    if not redis_host or not upstreams:
        print('You must specify a redis_host from the shipyard/redis container and at least one upstream from the shipyard/router container')
        sys.exit(1)
    check_valid_os()
    check_docker()
    # setup upstreams
    print(':: Setting up Shipyard Load Balancer')
    with hide('stdout', 'warnings'):
        build = True
        with settings(warn_only=True):
            out = sudo('docker ps | grep shipyard_lb')
            build = out.return_code
        if build:
            sudo('docker pull shipyard/lb')
            sudo('docker run -i -t -d -p 80:80 -name shipyard_lb -e REDIS_HOST={} -e APP_ROUTER_UPSTREAMS={} shipyard/lb'.format(redis_host, upstreams))
            print('-  Shipyard Load Balancer started')
            print('-  Update DNS to use {} for your Shipyard Domain'.format(env.host_string))

@task
def setup_shipyard_db(db_pass=None):
    check_valid_os()
    check_docker()
    print(':: Setting up Shipyard DB')
    if not db_pass:
        db_pass = ''.join(Random().sample(string.letters+string.digits, 8))
    with hide('stdout', 'warnings'):
        build = True
        with settings(warn_only=True):
            out = sudo('docker ps | grep shipyard_db')
            build = out.return_code
        if build:
            sudo('docker pull shipyard/db')
            ret = sudo('docker run -i -t -d -p 5432 -e DB_PASS={} -name shipyard_db shipyard/db'.format(db_pass))
            print('-  Shipyard DB started')

@task
def setup_shipyard(redis_host=None, admin_pass=None):
    check_valid_os()
    check_docker()
    with hide('stdout', 'warnings'):
        build = True
        with settings(warn_only=True):
            out = sudo('docker ps | grep shipyard/shipyard')
            build = out.return_code
        if build:
            sudo('docker pull shipyard/shipyard')
            sudo('docker run -i -t -d -p 5000:5000 -link shipyard_db:db -e REDIS_HOST={} -e ADMIN_PASS={} -name shipyard shipyard/shipyard app master-worker'.format(
                redis_host, admin_pass))
            print('-  Shipyard started with credentials: admin:{}'.format(admin_pass))
            while True:
                with settings(warn_only=True):
                    out = run('wget -O- --connect-timeout=1 http://{}:5000/'.format(env.host_string))
                    if out.find('Shipyard Project') != -1:
                        break
                    time.sleep(1)
            hostname = run('hostname')
            local_ip = get_local_ip()
            # add current host to api
            host_data = {
                'name': hostname,
                'hostname': local_ip,
                'public_hostname': env.host_string,
                'port': 4243,
                'enabled': True,
            }
            host_json = json.dumps(host_data)
            user_json = run('curl -d "username=admin&password={}" http://{}:5000/api/login'.format(admin_pass, env.host_string))
            user_data = json.loads(user_json)
            api_key = user_data.get('api_key')
            # add host
            run('curl -H "Authorization: ApiKey admin:{}" -d \'{}\' -H "Content-type: application/json" http://{}:5000/api/v1/hosts/'.format(api_key, host_json, env.host_string))
        print('-  Shipyard available on http://{}:5000'.format(env.host_string))

@task
def setup(lb_host=None, core_host=None):
    # setup redis
    env.host_string = lb_host
    print(':: Configuring Redis on {}'.format(env.host_string))
    execute(setup_redis)
    # setup app router
    print(':: Configuring Router on {}'.format(env.host_string))
    ret = execute(setup_app_router, lb_host)
    h, upstream = ret.popitem()
    # setup lb
    print(':: Configuring Load Balancer on {}'.format(env.host_string))
    execute(setup_load_balancer, lb_host, upstream)
    # setup shipyard
    env.host_string = core_host
    # generate db_pass
    db_pass = ''.join(Random().sample(string.letters+string.digits, 8))
    admin_pass = ''.join(Random().sample(string.letters+string.digits, 12))
    print(':: Configuring Shipyard DB on {}'.format(env.host_string))
    execute(setup_shipyard_db, db_pass)
    print(':: Configuring Shipyard on {}'.format(env.host_string))
    execute(setup_shipyard, lb_host, admin_pass)

@task
def teardown(lb_host=None, core_host=None):
    env.warn_only = True
    with hide('stdout', 'warnings'):
        env.host_string = lb_host
        print(':: Tearing down Shipyard Redis')
        sudo('docker kill shipyard_redis')
        sudo('docker rm shipyard_redis')
        print(':: Tearing down Shipyard Load Balancer')
        sudo('docker kill shipyard_lb')
        sudo('docker rm shipyard_lb')
        env.host_string = core_host
        print(':: Tearing down Shipyard Router')
        sudo("docker ps -a | grep shipyard/router | awk '{ print $1; }' | xargs sudo docker kill")
        sudo("docker ps -a | grep shipyard/router | awk '{ print $1; }' | xargs sudo docker rm")
        print(':: Tearing down Shipyard DB')
        sudo('docker kill shipyard_db')
        sudo('docker rm shipyard_db')
        print(':: Tearing down Shipyard')
        sudo('docker kill shipyard')
        sudo('docker rm shipyard')

@task
def check_env(lb_host=None, core_host=None):
    env.warn_only = True
    with hide('warnings'):
        env.host_string = lb_host
        sudo('docker ps | grep shipyard/redis')
        sudo('docker ps | grep shipyard/lb')
        env.host_string = core_host
        sudo('docker ps | grep shipyard/router')
        sudo('docker ps | grep shipyard/db')
        sudo('docker ps | grep shipyard/shipyard')

@task
def clean(lb_host=None, core_host=None):
    env.warn_only = True
    execute(teardown, lb_host, core_host)
    with hide('stdout', 'warnings'):
        env.host_string = lb_host
        print(':: Removing images')
        sudo('docker rmi shipyard/redis')
        sudo('docker rmi shipyard/lb')
        env.host_string = core_host
        sudo('docker rmi shipyard/router')
        sudo('docker rmi shipyard/db')
        sudo('docker rmi shipyard/shipyard')

@task
def help():
    text = """
Shipyard Deployer

This is a quick method to get a production Shipyard setup deployed.  You will
need the following:

    * Python
    * Fabric (`easy_install fabric` or `pip install fabric`)
    * 2 x Remote Hosts with SSH access and sudo (currently Debian or Ubuntu)

For this deployment method there are two types of nodes: "lb" and "core".  The
"lb" node is the load balancer.  This will be used for the master Redis
instance and the Shipyard Load Balancer.  The "core" node should larger.  It
will be used for the App Router, DB, and the Shipyard UI as well as any other
containers you want.

For a fully automated deployment, run:

    fab setup:<lb_hostname>,<core_hostname>

This will install all components on the two instances and return the login
credentials when finished.

To remove a deployment:

    fab teardown:<lb_hostname>,<core_hostname>

To clean (removes Docker images):

    fab clean:<lb_hostname>,<core_hostname>

There are several fabric "tasks" that you can use to deploy various components.
To see available tasks run "fab -l".  You can run a specific task like:

    fab -H <my_hostname> <task_name>

For example:

    fab -H myhost.domain.com install_docker

If you have issues please do not hesitate to report via Github or visit us
on IRC (freenode #shipyard).
"""
    print(text)
