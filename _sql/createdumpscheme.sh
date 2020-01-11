#!/bin/bash

pg_dump --host localhost --port 5432 --username "login" --format plain -s 'odo24' > dump_scheme.sql