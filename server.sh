#!/bin/bash

function usage
{
  echo  "Usage:"
  echo -e "create <port> \t create a server"
  echo -e "start \t\t start server"
  echo -e "stop \t\t stop server"
  echo -e "destroy \t delete created server"
  exit 1;
}

if [ -z "$1" ]; then
 usage
fi

case "$1" in  
		create)
		if [ -z "$2" ]; then
		  echo "server port number?"
		  exit 1;
		fi

		# Start a data volume instance of RethinkDB
		docker run -it -d --name shipyard-rethinkdb-data \
		  --entrypoint /bin/bash shipyard/rethinkdb -l

		# Start RethinkDB with using the data volume container
		docker run -it -d --name shipyard-rethinkdb \
		  --volumes-from shipyard-rethinkdb-data shipyard/rethinkdb

		# Wait til db container ready
		sleep 5

		# Start the Shipyard controller
		docker run -it -p "$2":8080 -d --name shipyard \
		  --link shipyard-rethinkdb:rethinkdb shipyard/shipyard
		;;

		start)
		docker start shipyard-rethinkdb-data shipyard-rethinkdb
		sleep 5
		docker start shipyard
		;;

		stop)
		docker stop shipyard shipyard-rethinkdb shipyard-rethinkdb-data
		;;

		destroy)
		docker rm -f shipyard-rethinkdb-data shipyard-rethinkdb shipyard
		;;

		*)usage
esac
