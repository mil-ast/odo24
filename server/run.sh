#!/bin/bash

cd /opt/odo24/server
mkdir -p  /var/log/odo24
nohup ./sto > "/var/log/odo24/$(date '+%Y.%m.%d').out" &
