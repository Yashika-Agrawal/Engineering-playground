# Server Deployment & Multi-Platform Architecture

## 1. Why Dockerize the Server Deployment?

- **Why:** In our earlier setup, we deployed directly on the VM host. That required installing Node.js, npm, and Nginx directly on the VM, building code on the server, and risking dependency mismatches between our laptop and the server.
- **What changed:** We packaged the entire application (compiled code + lightweight Nginx) into a single Docker image in CI. Now, the server doesn't need Node or build tools—it only needs Docker to run the container.

---

## 2. Why Install Docker on the Ubuntu VM?

- **Why:** The VM is our hosting server. To run our containerized application, the VM needs a container runtime (Docker daemon).
- **Why `docker.io` instead of `docker-desktop`:** Docker Desktop is a GUI tool for local desktop environments (Mac/Windows). Headless Linux servers run Docker Engine directly via systemd.
- **Setup commands on VM:**
  ```bash
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose
  sudo systemctl enable --now docker
  sudo usermod -aG docker $USER
  newgrp docker
  ```

---

## 3. Why Multi-Platform Builds? (`amd64` vs `arm64`)

- **Why:** 
  - GitHub Actions runners (`ubuntu-latest`) run on Intel/AMD CPUs (`linux/amd64`). By default, they produce `amd64` images.
  - Our local Multipass VM runs on Apple Silicon (`linux/arm64`).
  - Attempting to pull an `amd64`-only image on an ARM server fails with:
    `no matching manifest for linux/arm64/v8 in the manifest list entries`
- **Solution:** 
  - Added QEMU emulation and Buildx with `platforms: linux/amd64,linux/arm64` in `.github/workflows/frontend.yml`.
  - Now a single push creates an image that runs seamlessly on both x86 cloud servers and ARM servers/VMs:
    ```yaml
    - name: Build and push
      uses: docker/build-push-action@v7
      with:
        context: ./frontend
        file: ./frontend/Dockerfile
        push: true
        platforms: linux/amd64,linux/arm64
        tags: |
          ${{ vars.DOCKERHUB_USERNAME }}/railrush:latest
          ${{ vars.DOCKERHUB_USERNAME }}/railrush:1.0
    ```

---

## 4. Automating Container Deployment in CI/CD

Instead of manually pulling and running the container on the VM every time code is pushed, the `deploy` job on our self-hosted runner automates the update cycle.

### The 4 Deployment Steps & Why:

1. **Stop & Remove Existing Container (`docker stop ... && docker rm ...`):**
   - **Why:** Docker does not allow two containers with the same name (`railrush-container`) or binding to the same port (`8080`). We must stop and remove the old running container before starting the updated one.
   - `|| true` ensures the step doesn't fail on the very first run when no previous container exists.

2. **Pull Latest Image (`docker pull <username>/railrush:latest`):**
   - **Why:** `docker run` uses cached local images if available. Explicitly pulling ensures the server fetches the newly built image layer from Docker Hub.

3. **Run New Container (`docker run -d -p 8080:80 --name railrush-container ...`):**
   - **Why:** Spawns a fresh container running the latest code.
   - `-d`: Detached mode (runs continuously in background).
   - `-p 8080:80`: Routes traffic from server port `8080` to the container's internal Nginx on port `80`.

4. **Clean Up Unused Images (`docker image prune -f`):**
   - **Why:** Every new build leaves behind the previous image layer as a "dangling" (untagged) image. Without cleanup, disk space on the server gradually fills up over time.

### Workflow Implementation:

```yaml
  deploy:
    runs-on: self-hosted
    needs: docker-build-push

    steps:
      - name: Stop and remove existing container
        run: |
          docker stop railrush-container || true
          docker rm railrush-container || true

      - name: Pull latest image from Docker Hub
        run: |
          docker pull ${{ vars.DOCKERHUB_USERNAME }}/railrush:latest

      - name: Run updated container
        run: |
          docker run -d -p 8080:80 --name railrush-container ${{ vars.DOCKERHUB_USERNAME }}/railrush:latest

      - name: Clean up unused Docker images
        run: |
          docker image prune -f
```

---

## 5. Troubleshooting: Docker Socket Permission Denied

### What error we got in GitHub Actions:
```text
Run docker pull yashika292002/railrush:latest
permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
Error: Process completed with exit code 1.
```

### Why did this happen?
- The Docker daemon communicates via a Unix domain socket at `/var/run/docker.sock`, which is owned by `root:docker`.
- Our GitHub Actions self-hosted runner was running as a background systemd service under the `ubuntu` user.
- Because the runner service was started before the user had active docker socket permissions (or because systemd processes don't inherit dynamic group changes without a full reboot/re-login), it was blocked from reading or writing to the Docker socket.

### How we solved it:
1. Ensure the user belongs to the `docker` group:
   ```bash
   sudo usermod -aG docker $USER
   ```
2. Grant read/write permissions to the Docker socket file so the runner background service can communicate with the daemon:
   ```bash
   sudo chmod 666 /var/run/docker.sock
   sudo systemctl restart docker
   ```
3. Restart the actions runner service (or re-run the job in GitHub Actions):
   ```bash
   cd ~/actions-runner
   sudo ./svc.sh stop
   sudo ./svc.sh start
   ```

---

## 6. Key Architecture Principles

1. **Multi-Stage Build:** Uses Node in Stage 1 to build static assets, then copies them to a minimal Nginx image in Stage 2. Discards build tools and node_modules to keep the image lightweight (~25MB) and secure.
2. **Immutability:** The exact artifact tested and built in CI is what gets deployed to the server, eliminating environment drift.
3. **Cross-Architecture Portability:** Multi-platform manifests guarantee the same image tag runs on any CPU architecture without rebuilds.
