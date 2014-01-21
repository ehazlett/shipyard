# Module:   help
# Date:     28th November 2013
# Author:   James Mills, j dot mills at griffith dot edu dot au

"""
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

    fab -H <docker-host> setup

This will install all components on the two instances and return the login
credentials when finished.

To remove a deployment:

    fab -H <docker-host> teardown

To clean (removes Docker images):

    fab -H <docker-host> clean

There are several fabric "tasks" that you can use to deploy various components.
To see available tasks run "fab -l".  You can run a specific task like:

    fab -H <my_hostname> <task_name>

For example:

    fab -H myhost.domain.com install_docker

If you have issues please do not hesitate to report via Github or visit us
on IRC (freenode #shipyard).
"""


from __future__ import print_function


from fabric import state
from fabric.api import task
from fabric.tasks import Task
from fabric.task_utils import crawl


@task(default=True)
def help(name=None):
    """Display help for a given task

    Options:
        name    - The task to display help on.

    To display a list of available tasks type:

        $ fab -l

    To display help on a specific task type:

        $ fab help:<name>
    """

    if name is None:
        print(__doc__)
        return

    task = crawl(name, state.commands)
    if isinstance(task, Task):
        doc = getattr(task, "__doc__", None)
        if doc is not None:
            print("Help on {0:s}:".format(name))
            print()
            print(doc)
        else:
            print("No help available for {0:s}".format(name))
    else:
        print("No such task {0:s}".format(name))
        print("For a list of tasks type: fab -l")
