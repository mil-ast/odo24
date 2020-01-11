#!/bin/bash

 pg_dump -t 'service_groups.defaut_groups' -a odo24 > dump_default_groups.sql