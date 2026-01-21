<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1rnJ7EJDjkRHaoVKBGGk8HgdYawUS2JAP

**Prerequisites:**  Node.js

---

# 🎨 Chronos Canvas (collaboration-app)

A real-time collaboration application built with **Next.js** and designed for high-availability deployment on **Kubernetes**. This project serves as the flagship service for a hybrid homelab environment, bridging development on **Apple Silicon (M4 Mac Mini)** and production on **Ryzen/AMD64 (GMKtec K8 Plus)**.

---

## 🚀 1. What it Does

* **Real-time Synchronization:** Multiple users can collaborate simultaneously.
* **Responsive UI:** Optimized for both desktop and mobile layouts.
* **Multi-Arch Support:** Custom Docker builds that run natively on both `arm64` (Mac) and `amd64` (Ryzen).
* **GitOps Ready:** Integrated with Flux CD for automated "set and forget" deployments.

---

## 🛠 2. Steps to Build

To prepare the application for production locally:

```bash
# Install dependencies
npm install

# Create an optimized production build
npm run build

```

---

## 💻 3. Steps to Run Locally (M4 Mac Mini)

For rapid development with **Hot Module Replacement (HMR)**:

```bash
# Start the dev server
npm run dev

```

*The app will be available at `http://localhost:3000`.*

---

## 🐳 4. Manual Docker Build & Push (Buildx)

Since the production server (GMKtec) uses a different CPU architecture than the Mac Mini, we use **Docker Buildx** to create a universal image.

```bash
# 1. Create a new builder that supports multi-arch (one-time setup)
docker buildx create --use

# 2. Build and push for both ARM64 and AMD64 architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <your-dockerhub-username>/collaboration-app:latest \
  --push .

```

---

## 🔄 5. The CI/CD Setup (The "GitOps" Pipeline)

Our automated pipeline ensures that every code change reaches the GMKtec cluster without manual intervention.

1. **Code:** Developer pushes code to the `main` branch on GitHub.
2. **CI (GitHub Actions):** GitHub spins up a runner, uses **Buildx** to compile the `amd64/arm64` images, and pushes them to **Docker Hub**.
3. **CD (Flux):** The **GMKtec K8 Plus** runs a Flux controller that watches the `fleet-infra` repo.
4. **Deployment:** Flux detects the new image and triggers a **Rolling Update** in the Talos Kubernetes cluster, ensuring zero downtime.

---

## ☸️ 6. Accessing the App in Kubernetes

Once deployed to your cluster, the app is isolated inside the internal network. Use these methods to access it from your Mac Mini:

### Method A: Port Forwarding (Quickest)

This creates a direct tunnel to the pods.

```bash
kubectl port-forward svc/collaboration-app-service 8080:80

```

*Access at: `http://localhost:8080*`

### Method B: NodePort (Internal Network)

If the Service is set to `type: NodePort`, access it using the GMKtec's IP:

```bash
# Find the assigned port (usually 30000-32767)
kubectl get svc collaboration-app-service

```

*Access at: `http://<GMKTEC_IP>:<NODE_PORT>*`

---

### 📋 Status Check

To see the health of your production deployment:

```bash
kubectl get pods -l app=collaboration-app -o wide

```

**Would you like me to add a "Troubleshooting" section to this README that includes the specific commands for fixing the Docker Hub 401/Scope errors we encountered?**