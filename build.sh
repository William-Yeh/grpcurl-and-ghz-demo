#!/bin/bash

mkdir out

go build -o ./out  server/server.go

go build -o ./out  server-new/server-new.go
