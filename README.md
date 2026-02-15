
# Run and deploy your Vocal Canvas app

This contains everything you need to run your app locally.

View experimental demo at: https://nighutlabs.dev/mydesigns

**Prerequisites:**  Node.js

---

# 🎨 React Konva based System Design Canvas App (collaboration-app)

A real-time system design collaboration application built with **Next.js** and designed for high-availability deployment on **Kubernetes**. This project serves as the flagship service for a hybrid homelab environment, bridging development on **Apple Silicon (M4 Mac Mini)** and production on **Ryzen/AMD64 (GMKtec K8 Plus)**.

---

## 🚀 1. What it Does

* **Real-time Design Generation:** Users can generate design using basic AI agent. They can also manually update the design using drag drop options.
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

### 🔄 7. Forcefully Updating Production (The `:latest` Trap)

Because we are using the `:latest` Docker tag, the **GMKtec K8 Plus** won't always realize a new image is available on Docker Hub. Use these commands to force a fresh pull and watch the update happen in real-time.

#### **The "One-Two Punch" Command**

Run this on your **M4 Mac Mini** terminal to trigger the update and monitor the transition:

```bash
# Trigger a rolling restart of the deployment
kubectl rollout restart deployment collaboration-app && kubectl get pods -w

```

#### **What these commands do:**

1. **`kubectl rollout restart`**: This adds a "restartedAt" timestamp to your Deployment's metadata. Kubernetes sees this change and realizes it needs to create new pods. Because the image tag is `:latest`, it will reach out to Docker Hub to pull the most recent version.
2. **`&&`**: This chains the commands. It only starts the "watch" if the restart command succeeds.
3. **`kubectl get pods -w`**: This opens a live stream of your pod statuses. You will see:
* **Pending/ContainerCreating**: The new version starting up.
* **Running**: The new version is healthy.
* **Terminating**: The old version being gracefully shut down.



> **Pro Tip:** If the "AGE" column of the new pods says only a few seconds, you have successfully updated your production environment! Use `Ctrl + C` to exit the watch mode.

---

### Why this section is important for your setup

In your current CI/CD flow:

* **GitHub Actions** pushes a new image to Docker Hub.
* **Flux CD** watches your `fleet-infra` repo for YAML changes.
* **The Problem:** Since the YAML file still says `image: ...:latest`, Flux thinks nothing has changed.

The commands above "kick" Kubernetes into checking for that new image manually.
---

### 📋 Status Check

To see the health of your production deployment:

```bash
kubectl get pods -l app=collaboration-app -o wide

```

**Would you like me to add a "Troubleshooting" section to this README that includes the specific commands for fixing the Docker Hub 401/Scope errors we encountered?**
