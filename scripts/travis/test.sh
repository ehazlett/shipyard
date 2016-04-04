#!/bin/bash
cd ../../ && go test -v `go list ./... | grep -v /vendor`
