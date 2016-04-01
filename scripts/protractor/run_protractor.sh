#!/usr/bin/env bash
DOCKER_HOST=$(ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+')

# TODO: need to evaluate this image with headless chrome in CI environment
sudo docker run -it --privileged -e DOCKER_HOST=$DOCKER_HOST --rm --net=host -v /dev/shm:/dev/shm -v $(pwd):/protractor webnicer/protractor-headless conf.js