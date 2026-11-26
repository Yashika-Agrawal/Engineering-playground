# Docker Compose & Caddy Reverse Proxy Architecture

## 1. High-Level Concept: Why Do We Need Docker Compose and Caddy?

### The Problem with Single Containers
Up until now, we managed containers manually using single terminal commands:
```bash
docker run -d -p 80:80 --name my-app my-image:latest
```
While this works for running one app, modern architectures rarely have only one service. In real production, you often need:
1. **Application Servers:** One or more backend/frontend service containers.
2. **Reverse Proxy & SSL Manager:** A front-facing gateway (like Caddy) that takes public internet traffic, handles HTTPS encryption, and routes requests to the right internal container.

If we run all of these using individual `docker run` commands:
- You have to remember long CLI flags for every container.
- You have to manually create and manage networks and volume flags.
- If the server restarts, you have to manually re-type every command in the right order.

### The Solution: Docker Compose
**Docker Compose** is a tool that lets you define and manage **multi-container environments using a single YAML configuration file** (`docker-compose.yml`).
- Instead of running multiple separate `docker run` commands, you write your infrastructure as code in one file.
- You control the entire application stack with single commands:
  - `docker compose up -d` (starts everything)
  - `docker compose down` (stops everything)

### How Caddy Fits In
**Caddy** acts as the single receptionist (Reverse Proxy) sitting in front of your internal services:
- **Outside World (Public):** Caddy listens on public HTTP (`80`) and HTTPS (`443`).
- **Inside World (Private):** Caddy forwards incoming requests to the internal application container over a private Docker network.
- **Automatic HTTPS:** Caddy obtains, configures, and renews SSL certificates from Let's Encrypt with zero manual intervention.

---

## 2. High-Level Architecture Flow

```text
User's Browser (https://yourdomain.com or http://<server-ip>)
                       │
                       ▼ (Ports 80 / 443)
       ┌───────────────────────────────┐
       │        Caddy Container        │  <─── Public Entry Point (Reverse Proxy + SSL)
       └───────────────┬───────────────┘
                       │
      ═════════════════╪═════════════════  <─── Private Bridge Network ("internal-net")
                       │
                       ▼ (Internal container DNS: "frontend:80")
       ┌───────────────────────────────┐
       │      Frontend Container       │  <─── Hidden from public internet (No public port)
       └───────────────────────────────┘
```

---

## 3. The `docker-compose.yml` File Explained Line-by-Line

```yaml
# Top-level key that defines all the container services running in this stack
services:

  # ----------------------------------------------------
  # SERVICE 1: The Application (Frontend)
  # ----------------------------------------------------
  frontend:
    # Docker Hub image to download and run
    image: yashika292002/railrush:latest

    # Restart policy: if the container crashes or host reboots, Docker restarts it automatically
    restart: always

    # Connects this container to an isolated private virtual network
    # Note: NO "ports:" section here! The app is completely hidden from the public internet.
    networks:
      - internal-net

  # ----------------------------------------------------
  # SERVICE 2: Caddy Reverse Proxy & Web Server
  # ----------------------------------------------------
  caddy:
    # Official lightweight Caddy Docker image (~30MB)
    image: caddy:alpine

    # Auto-restart on crash or host system reboot
    restart: always

    # Port mapping: maps Host VM ports to Caddy container ports
    # Port 80 = Standard HTTP web traffic
    # Port 443 = Standard HTTPS encrypted web traffic
    ports:
      - "80:80"
      - "443:443"

    # Volume mounts: maps local files and Docker volumes into Caddy
    volumes:
      # Mounts our local Caddyfile into Caddy's configuration directory
      - ./Caddyfile:/etc/caddy/Caddyfile

      # Persistent storage for SSL certificates issued by Let's Encrypt
      # Critical: Without this volume, restarting the container deletes certificates!
      - caddy_data:/data

      # Persistent storage for Caddy's runtime configuration and internal cache
      - caddy_config:/config

    # Connects Caddy to the same private virtual network as frontend so they can communicate
    networks:
      - internal-net

    # Startup order: ensures the 'frontend' container is started before Caddy starts
    depends_on:
      - frontend

# ----------------------------------------------------
# NETWORKS: Private Virtual Subnet
# ----------------------------------------------------
networks:
  internal-net:
    # Standard software bridge network allowing containers to talk to each other
    # using service names as domain names (e.g. Caddy can reach "frontend:80")
    driver: bridge

# ----------------------------------------------------
# VOLUMES: Persistent Storage Managed by Docker
# ----------------------------------------------------
volumes:
  caddy_data:   # Persists SSL certificates permanently across container updates
  caddy_config: # Persists Caddy state permanently across container updates
```

---

## 4. The `Caddyfile` Explained Line-by-Line

The `Caddyfile` is Caddy's human-readable configuration file. It tells Caddy which domains or ports to listen to, and where to forward the requests.

### Option A: Local / Direct IP Access (Port 80)
```caddyfile
# Listen on HTTP port 80 for any incoming request
:80 {
    # Forward all traffic internally to the 'frontend' container on port 80
    reverse_proxy frontend:80
}
```

### Option B: Production with Domain & Automated HTTPS (DuckDNS / Custom Domain)
```caddyfile
# Listen on this domain; Caddy automatically requests and manages Let's Encrypt SSL certificates
railrush-dev.duckdns.org {
    # Forward all encrypted HTTPS traffic internally to the 'frontend' container
    reverse_proxy frontend:80
}
```

---

## 5. Basic Operations Cheat Sheet

Run these commands in the directory where `docker-compose.yml` and `Caddyfile` are located:

```bash
# 1. Start all services in the background (detached mode)
docker compose up -d

# 2. View running containers and their status
docker compose ps

# 3. View live logs (great for checking Caddy's SSL certificate progress)
docker compose logs -f caddy

# 4. Stop and remove all containers and networks (volumes remain safe)
docker compose down
```

---

## 6. How CI/CD Deployment Changes with Docker Compose

### The Problem with Single-Container CI/CD Commands:
Earlier, our deployment script in GitHub Actions was running:
```bash
docker stop railrush-container
docker rm railrush-container
docker pull <image>
docker run -d -p 80:80 --name railrush-container ...
```

**Why this breaks when moving to Docker Compose & Caddy:**
1. **Isolated from Caddy:** A container started with `docker run` is not part of the `internal-net` network. Caddy cannot find or route traffic to it.
2. **Port Conflicts:** If `docker run` binds port `80`, Caddy cannot start because Caddy needs port `80` and `443`.
3. **Downtime & Manual Teardown:** Stopping and removing manually causes downtime and ignores the declarative compose setup.

### The Solution: Docker Compose Deployment Flow:
Instead of manual container management, the CI/CD deployment script uses Docker Compose:

```yaml
  deploy:
    runs-on: self-hosted
    needs: docker-build-push

    steps:
      # Step 1: Get the latest Caddyfile and docker-compose.yml configurations
      - name: Pull latest code (docker-compose & Caddyfile)
        run: |
          cd /home/ubuntu/RailRush
          git pull

      # Step 2: Download the newly pushed image layers from Docker Hub
      - name: Pull latest Docker images
        run: |
          cd /home/ubuntu/RailRush/frontend
          docker compose pull

      # Step 3: Recreate only the updated containers with zero manual teardown
      - name: Deploy updated services with Docker Compose
        run: |
          cd /home/ubuntu/RailRush/frontend
          docker compose up -d

      # Step 4: Remove outdated dangling image layers to save disk space
      - name: Clean up unused Docker images
        run: |
          docker image prune -f
```

### Why This Is Better:
- **Declarative Updates (`docker compose up -d`):** Docker Compose inspects the running containers against the new image. It **only restarts the `frontend` container** that changed. Caddy stays up without dropping active connections.
- **Automatic Network Wiring:** The recreated container is automatically reattached to `internal-net` with the hostname `frontend`, so Caddy's reverse proxy keeps working seamlessly.
