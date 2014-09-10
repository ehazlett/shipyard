#!/bin/bash
blue='\e[0;34m'
reset='\e[0m'
if [ ! -z "$NAME" ]; then
    NAME="-$NAME"
fi
function run() {
    echo -ne "${blue}shipyard$NAME> ${reset}"
    read CMD
    shipyard $CMD
}

function kill() {
    echo ""
    echo -n "Quit? (y/n): "
    read QUIT
    if [ "$QUIT" = "y" ]; then
        exit 0
    else
        echo -ne "${blue}shipyard$NAME> ${reset}"
    fi
}

trap kill SIGINT

while true
do
    run
done
