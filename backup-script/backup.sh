#!/bin/bash

docker exec -t trofos-postgres-1 pg_dumpall -c -U postgres | gzip > ~/backups/dump_$(date +"%Y-%m-%d_%H_%M_%S").gz
rclone sync ~/backups remote:backups
mkdir -p logs
echo "Backed up at $(date +"%Y-%m-%d_%H_%M_%S")" > ./logs/$(date +"%Y-%m-%d_%H_%M_%S").log