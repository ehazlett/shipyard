#!/bin/bash
go test $* .
pushd controller/middleware > /dev/null
go test $* .
popd
