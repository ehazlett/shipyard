# for Shipyard's Vagrantfile to deploy Shipyard to AWS

#aws.access_key_id = ENV["AWS_ACCESS_KEY_ID"]
export AWS_ACCESS_KEY_ID='replaceme'

#aws.secret_access_key = ENV["AWS_SECRET_ACCESS_KEY"]
export AWS_SECRET_ACCESS_KEY='replaceme'                                                                                                  

#aws.keypair_name = ENV["AWS_KEYPAIR_NAME"]
export AWS_KEYPAIR_NAME='shipyard'

#override.ssh.private_key_path = ENV["AWS_SSH_PRIVKEY"]
export AWS_SSH_PRIVKEY='/home/username/.ssh/shipyard.pem'

#export AWS_SECURITY_GROUPS='["shipyard"]'
#AWS_REGION = ENV['AWS_REGION'] || "us-east-1"
#AWS_AMI    = ENV['AWS_AMI']    || "ami-d0f89fb9"
