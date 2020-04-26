#!/bin/bash

cd /opt/sto/web/welcome
mkdir -p  /var/log/odo24
nohup ./welcome > "/var/log/odo24/welcome_$(date '+%Y.%m.%d').out" &
