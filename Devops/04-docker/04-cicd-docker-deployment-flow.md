# Automated CI/CD & Docker Deployment Flow

This document provides a fast visual overview of the entire end-to-end deployment pipeline.

---

## Architecture & Workflow Diagram

```mermaid
flowchart TD
    subgraph Local["Developer Machine - MacBook"]
        A["Code Changes in RailRush - e.g. App.tsx"] --> B["git push origin main"]
    end

    subgraph CI["GitHub Actions Cloud - ubuntu-latest"]
        B --> C["Trigger Workflow: frontend.yml"]
        C --> D["Job 1: docker-build-push"]
        D --> D1["docker/login-action - Auth to DockerHub"]
        D1 --> D2["Setup QEMU and Docker Buildx"]
        D2 --> D3["Build Multi-Platform Image - amd64 and arm64"]
        D3 --> D4["Push to Docker Hub - latest and 1.0"]
    end

    subgraph Registry["Docker Hub Registry"]
        D4 --> R[("yashika292002/railrush Manifest")]
    end

    subgraph CD["Self-Hosted Runner - Ubuntu VM"]
        R -.->|Job 1 completes triggers Job 2| E["Job 2: deploy - runs-on self-hosted"]
        E --> E1["Step 1: Stop and Remove Existing Container"]
        E1 --> E2["Step 2: Pull Latest Image from DockerHub"]
        E2 --> E3["Step 3: Run Fresh Container on Port 80:80"]
        E3 --> E4["Step 4: Cleanup Unused Docker Images"]
    end

    subgraph Live["Verification & Browser Access"]
        E3 --> F["Browser: http://vm-ip/ - Port 80 Default"]
    end

    style Local fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style CI fill:#181825,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style Registry fill:#181825,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style CD fill:#181825,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Live fill:#1e1e2e,stroke:#94e2d5,stroke-width:2px,color:#cdd6f4
```

---

## Quick Reference Summary

| Phase | Where It Runs | Key Actions | Output |
| :--- | :--- | :--- | :--- |
| **1. Trigger** | Developer Mac | `git push origin main` | Pushes commit to GitHub |
| **2. Build & Publish** | GitHub Cloud (`ubuntu-latest`) | Logs into Docker Hub, uses QEMU + Buildx to build multi-arch images | Pushes `yashika292002/railrush:latest` and `:1.0` |
| **3. Deploy** | Ubuntu Multipass VM (`self-hosted`) | Stops old container, pulls latest image, runs on default port `80:80`, cleans unused layers | Zero-touch automated deployment |
| **4. Live Access** | Any Browser | Open `http://<vm-ip>/` (Standard Port 80) | Real-time deployed application |
