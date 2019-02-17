#!/bin/bash

cd /opt/sto/server
nohup ./sto > "/var/log/sto/$(date '+%Y.%m.%d').out" &
