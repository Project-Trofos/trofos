#!/bin/bash

# Variables
REPO_URL="https://github.com/Project-Trofos/trofos.git"
TARGET_DIR="/home/sadm//monitoring"
MONITORING_DIR="/home/sadm/monitoring/monitoring"

# Navigate to the target directory or clone the repo if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
  echo "Target directory does not exist. Cloning repository..."
  git clone $REPO_URL $TARGET_DIR || {
    echo "Error: Failed to clone the repository."
    exit 1
  }
fi

# Navigate to the target directory
cd $TARGET_DIR || {
  echo "Error: Target directory $TARGET_DIR does not exist."
  exit 1
}

# Pull the latest changes from the repository
git pull origin main || {
  echo "Error: Failed to pull from the repository."
  exit 1
}

# Navigate to the monitoring directory
cd $MONITORING_DIR || {
  echo "Error: Monitoring directory $MONITORING_DIR does not exist."
  exit 1
}

# Run docker-compose to restart the services
echo "Bringing down current Docker services..."
docker compose -f ./docker-compose-monitoring.yml down || {
  echo "Error: Failed to bring down docker-compose services."
  exit 1
}

echo "Bringing up Docker services..."
docker compose -f ./docker-compose-monitoring.yml up -d --build || {
  echo "Error: Failed to bring up docker-compose services."
  exit 1
}

echo "Deployment complete."
