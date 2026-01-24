# 🚀 Deployment Guide

Automated deployment pipeline for the Collaboration App to Kubernetes using Flux CD and GitOps.

## 📦 Quick Deploy

Deploy to production with a single command:

```bash
npm run force-push
```

This command will:
1. ✅ Generate a timestamp-based Docker tag
2. ✅ Build multi-platform Docker image (linux/amd64)
3. ✅ Push to Docker Hub (sbnighut/collaboration-app)
4. ✅ Update image tag in fleet-infra GitOps repository
5. ✅ Commit and push changes to fleet-infra
6. ✅ Trigger Flux reconciliation
7. ✅ Watch pod rollout in production

## 🔧 Prerequisites

Before deploying, ensure you have:

- **Docker Desktop** running and logged in
  ```bash
  docker login
  ```

- **kubectl** configured for production cluster
  ```bash
  kubectl config current-context
  ```

- **Flux CLI** installed
  ```bash
  flux version
  ```

- **Git credentials** configured for fleet-infra repository
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

- **Repository access** to:
  - Docker Hub: `docker.io/sbnighut/collaboration-app`
  - GitOps Repo: `/Users/swapnilnighut/git/fleet-infra`

## 📁 Repository Structure

```
collaboration-app/
├── scripts/
│   └── deploy.sh          # Automated deployment script
├── .env.deploy            # Deployment configuration
└── package.json           # npm scripts including force-push
```

## ⚙️ Configuration

### Environment Variables (.env.deploy)

```bash
FLEET_INFRA_PATH=/Users/swapnilnighut/git/fleet-infra
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=sbnighut
IMAGE_NAME=collaboration-app
K8S_NAMESPACE=production
```

### GitOps Repository

The deployment updates this file:
```
fleet-infra/clusters/production/collaboration-app/app.yaml
```

Specifically line 20:
```yaml
image: docker.io/sbnighut/collaboration-app:{TIMESTAMP}
```

## 🎯 Deployment Workflow

### Automated Process (npm run force-push)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Generate Tag (YYYYMMDD-HHMMSS)                          │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Build & Push Docker Image                               │
│    docker buildx build --platform linux/amd64 --push       │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Update fleet-infra/app.yaml                             │
│    sed -i '' 's/image:.*/image:...NEW_TAG/'                │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Git Commit & Push                                        │
│    git commit -m "Deploy collaboration-app:NEW_TAG"        │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Flux Reconciliation                                      │
│    flux reconcile source git flux-system                   │
│    flux reconcile kustomization collaboration-app          │
│    flux reconcile image update collaboration-app-automation│
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Watch Pods (kubectl get pods -n production -w)          │
└─────────────────────────────────────────────────────────────┘
```

### Manual Process (Legacy)

If you need to deploy manually:

```bash
# 1. Build and push
NEW_TAG="20260124-143000"
docker buildx build --platform linux/amd64 -t sbnighut/collaboration-app:${NEW_TAG} --push .

# 2. Update YAML
cd /Users/swapnilnighut/git/fleet-infra
# Edit clusters/production/collaboration-app/app.yaml line 20
git add . && git commit -m "Deploy ${NEW_TAG}" && git push

# 3. Reconcile Flux
flux reconcile source git flux-system
flux reconcile kustomization collaboration-app
flux reconcile image update collaboration-app-automation

# 4. Watch pods
kubectl get pods -n production -w
```

## 🐛 Troubleshooting

### Docker Build Fails

```bash
# Check Docker is running
docker ps

# Check buildx
docker buildx ls

# Check disk space
df -h
```

### Git Push Fails

```bash
# Check fleet-infra repo status
cd /Users/swapnilnighut/git/fleet-infra
git status
git pull --rebase

# Check credentials
git config user.name
git config user.email
```

### Flux Reconciliation Fails

```bash
# Check Flux status
flux get all -A

# Check kustomization
flux get kustomization collaboration-app

# Force reconcile
flux reconcile kustomization collaboration-app --with-source
```

### Pods Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n production

# Check logs
kubectl logs <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

## 📊 Monitoring Deployment

### Check Image Tag in Cluster

```bash
kubectl get deployment collaboration-app -n production -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### Check Rollout Status

```bash
kubectl rollout status deployment/collaboration-app -n production
```

### Check Pod Status

```bash
kubectl get pods -n production -l app=collaboration-app
```

### View Recent Deployments

```bash
kubectl rollout history deployment/collaboration-app -n production
```

## 🔄 Rollback

If deployment fails, rollback to previous version:

```bash
# Rollback to previous revision
kubectl rollout undo deployment/collaboration-app -n production

# Rollback to specific revision
kubectl rollout undo deployment/collaboration-app -n production --to-revision=2
```

## 📝 Version Management

Tags are automatically generated using timestamps:
- Format: `YYYYMMDD-HHMMSS`
- Example: `20260124-143022`
- Benefits:
  - Chronologically sortable
  - Unique per deployment
  - Easy to identify deployment time

## 🔐 Security Notes

- Docker credentials stored in `~/.docker/config.json`
- Git credentials use system keychain
- Kubernetes credentials in `~/.kube/config`
- Never commit `.env.deploy` with sensitive data

## 🎓 Learn More

- [Flux CD Documentation](https://fluxcd.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [Kubernetes GitOps](https://www.gitops.tech/)

---

**Last Updated:** January 24, 2026  
**Maintained by:** Swapnil Nighut
