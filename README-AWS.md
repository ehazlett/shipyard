# Run Shipyard on AWS

You can run Shipyard on AWS by using the Vagrantfile-aws file which will use the provision-aws.sh script instead of the normal provision.sh.

```
$ mv Vagrantfile Vagrantfile-normal
$ mv Vagrantfile-aws Vagrantfile
```

## Install the vagrant-aws plugin

In order for Vagrant to provision to AWS, you need to install the vagrant-aws plugin.

```
$ vagrant plugin install vagrant-aws
```

See the [vagrant-aws](https://github.com/mitchellh/vagrant-aws/) page for more info.

## Configure the AWS environment variables

You need to edit the aws.sh file and add your AWS keys and such. Then source these so they're available to the script.

```
$ source aws.sh
```

## Create a security group named "shipyard" using the AWS console

If you want to be able to launch applications on non-standard ports, you need to create a new security group with special ports opened. You can do think from the [AWS console](https://console.aws.amazon.com/ec2/home?#s=SecurityGroups).

You should open ports 22, 80 and 4000-50000 (don't open these ports for production but for testing it's fine)

## Create the EC2 instance

Next you can run ``vagrant up`` and pass in the provider value to ``aws``.

```
$ vagrant up --provider=aws
```

## Make sure the services are running

Login to the newly created EC2 instance and see that the services are running.

```
$ vagrant ssh
$ sudo supervisorctl status
app                              RUNNING   
hipache                          RUNNING   
redis                            RUNNING   
worker                           RUNNING   
```

If any of them aren't running, find out why by looking at the log files in ``/var/log/supervisor``.

You should now be able to access Shipyard on port 8000.

## Add Shipyard to Hipache so you can access it on port 80

If you want to access Shipyard on port 80 rather than port 8000, you can add an entry in Redis that Hipache will use to route all requests to Shipyard.

```
$ redis-ctl
redis 127.0.0.1:6379> rpush frontend:ec2-xxx-xxx-xxx-xxx.compute-1.amazonaws.com shipyard
redis 127.0.0.1:6379> rpush frontend:ec2-xxx-xxx-xxx-xxx.compute-1.amazonaws.com http://127.0.0.1:8000
```

Note: replace ``ec2-xxx-xxx-xxx-xxx.compute-1.amazonaws.com`` with whatever your EC2 instance's public DNS is.

Confirm that they are in the datastore.

```
redis 127.0.0.1:6379> lrange frontend:ec2-xxx-xxx-xxx-xxx.compute-1.amazonaws.com 0 -1
1) "shipyard"
2) "http://127.0.0.1:8000"
```

Before you can start using Shipyard, you need to add the host. Click on the 'Hosts' tab, and add your public IP address (which will resolve to the internal IP) and the port 4243. Now you can proceed to the 'Images' tab and start adding images.

## Move the Docker containers to /mnt

The default EC2 instances only come with 10GB on the root volume, but there is a large volume at /mnt. To avoid running out of diskspace on the root volume.

```
sudo service docker stop
sudo mv /var/lib/docker /mnt/docker && ln -s /mnt/docker /var/lib/docker
```

Please note that if you are going to use this in production then you should mount an EBS volume so that the data is persisted. Any data stored in /mnt will be lost if the machine is stopped or terminated.
