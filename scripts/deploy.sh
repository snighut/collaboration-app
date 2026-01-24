#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment process...${NC}"

# Generate tag from timestamp
NEW_TAG=$(date +%Y%m%d-%H%M%S)
echo -e "${GREEN}📦 New tag: ${NEW_TAG}${NC}"

# Step 1: Build and push Docker image
echo -e "${BLUE}🔨 Building and pushing Docker image...${NC}"
docker buildx build --platform linux/amd64 -t sbnighut/collaboration-app:${NEW_TAG} --push .

# Step 2: Update the YAML file
FLEET_INFRA_PATH="${FLEET_INFRA_PATH:-/Users/swapnilnighut/git/fleet-infra}"
YAML_FILE="${FLEET_INFRA_PATH}/clusters/production/collaboration-app/app.yaml"

echo -e "${BLUE}📝 Updating ${YAML_FILE}...${NC}"

# Backup the original file
cp "${YAML_FILE}" "${YAML_FILE}.backup"

# Update the image tag in the YAML file (line 20)
sed -i '' "s|image: docker.io/sbnighut/collaboration-app:.*|image: docker.io/sbnighut/collaboration-app:${NEW_TAG}|g" "${YAML_FILE}"

echo -e "${GREEN}✅ Updated image tag to ${NEW_TAG}${NC}"

# Step 3: Commit and push changes to fleet-infra
cd "${FLEET_INFRA_PATH}"

# Pull latest changes first
echo -e "${BLUE}📥 Pulling latest changes from fleet-infra...${NC}"
git pull --rebase origin main

git add "${YAML_FILE}"
git commit -m "Deploy collaboration-app:${NEW_TAG}"
git push origin main

echo -e "${GREEN}✅ Pushed changes to fleet-infra${NC}"

# Step 4: Reconcile Flux
echo -e "${BLUE}🔄 Reconciling Flux...${NC}"

echo -e "${BLUE}  → Reconciling git source...${NC}"
flux reconcile source git flux-system

echo -e "${BLUE}  → Reconciling kustomization...${NC}"
flux reconcile kustomization collaboration-app

echo -e "${BLUE}  → Reconciling image automation...${NC}"
flux reconcile image update collaboration-app-automation || echo "Image automation not configured (skipping)"

echo -e "${GREEN}✅ Flux reconciliation complete${NC}"

# Step 5: Watch pods
echo -e "${BLUE}👀 Watching pods in production namespace...${NC}"
echo -e "${BLUE}Press Ctrl+C to exit${NC}"
kubectl get pods -n production -w
