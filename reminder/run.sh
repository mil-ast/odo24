#!/bin/bash

cd /opt/sto/server
nohup ./server > "/var/log/sto/$(date '+%Y.%m.%d').out" &
