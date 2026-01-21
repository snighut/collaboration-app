#!/bin/bash

# 1. Variables
DOCKER_USER="your-dockerhub-username"
APP_NAME="collaboration-app"

# 2. Generate the dynamic tag (e.g., 20260121-a1b2c3d)
TIMESTAMP=$(date +%Y%m%d-%H%M)
GIT_SHA=$(git rev-parse --short HEAD)
TAG="${TIMESTAMP}-${GIT_SHA}"

FULL_IMAGE="${DOCKER_USER}/${APP_NAME}:${TAG}"

echo "Building image: ${FULL_IMAGE}..."

# 3. Build and Push
docker build -t "${FULL_IMAGE}" .
docker push "${FULL_IMAGE}"

# (Optional) Also push 'latest' for convenience
docker tag "${FULL_IMAGE}" "${DOCKER_USER}/${APP_NAME}:latest"
docker push "${DOCKER_USER}/${APP_NAME}:latest"

echo "Done! New tag pushed: ${TAG}"