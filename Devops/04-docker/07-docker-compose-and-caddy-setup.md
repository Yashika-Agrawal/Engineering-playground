# Docker Compose & Caddy Reverse Proxy Configuration

This document explains the exact code written in `frontend/docker-compose.yml` and `frontend/Caddyfile`, line by line.

---

## 1. Code Review & Fixes

### What was checked:
1. **`docker-compose.yml`**:
   - **Status:** **100% Correct!**
   - Service names match properly (`frontend`), internal bridge network is configured, ports `80` and `443` are routed to Caddy, and persistent volumes are set up.
2. **`Caddyfile` Fix**:
   - In Caddy syntax, the directive is written with an underscore: `reverse_proxy` (not a hyphen `reverse-proxy`).
   - We updated it to:
     ```caddyfile
     :80 {
         reverse_proxy frontend:80
     }
     ```
   - *(Note: If you want to use your DuckDNS domain with automatic SSL, replace `:80` with `railrush-dev.duckdns.org`).*

---

## 2. Line-by-Line Breakdown: `docker-compose.yml`

```yaml
# Top-level key that defines all the containers we want to run together
services:

  # ----------------------------------------------------
  # SERVICE 1: The React Frontend Application
  # ----------------------------------------------------
  frontend:
    # Docker Hub image to download and run
    image: yashika292002/railrush:latest

    # If the container crashes or the server reboots, Docker automatically restarts it
    restart: always

    # Connects this container to our private virtual network
    # (Notice: NO "ports:" section! It is completely hidden from the outside world)
    networks:
      - internal-net

  # ----------------------------------------------------
  # SERVICE 2: Caddy Reverse Proxy & Web Server
  # ----------------------------------------------------
  caddy:
    # Official lightweight Caddy Docker image (~30MB)
    image: caddy:alpine

    # Auto-restart on crash or reboot
    restart: always

    # Port mapping: maps Host VM ports to Caddy container ports
    # Port 80 = Standard HTTP traffic
    # Port 443 = Standard HTTPS encrypted traffic
    ports:
      - "80:80"
      - "443:443"

    # Mounts files and persistent storage into the container
    volumes:
      # Mounts our local Caddyfile config file into Caddy's config directory
      - ./Caddyfile:/etc/caddy/Caddyfile

      # Persistent storage: Saves SSL certificates from Let's Encrypt so they aren't lost on restart
      - caddy_data:/data

      # Persistent storage: Saves Caddy's internal runtime state and cache
      - caddy_config:/config

    # Connects Caddy to the same private virtual network as frontend
    networks:
      - internal-net

    # Ensures 'frontend' container is started before Caddy starts
    depends_on:
      - frontend

# ----------------------------------------------------
# NETWORKS: Private Virtual Subnet
# ----------------------------------------------------
networks:
  internal-net:
    # Standard software bridge network allowing containers to talk via their service names (e.g. "frontend:80")
    driver: bridge

# ----------------------------------------------------
# VOLUMES: Persistent Storage Managed by Docker
# ----------------------------------------------------
volumes:
  caddy_data:   # Preserves SSL certificates permanently
  caddy_config: # Preserves Caddy configurations permanently
```

---

## 3. Line-by-Line Breakdown: `Caddyfile`

### For Local / Internal Testing (Port 80):
```caddyfile
# Listen on HTTP port 80 for any incoming hostname/IP
:80 {
    # Forward all incoming traffic to the 'frontend' container on its internal port 80
    reverse_proxy frontend:80
}
```

### For Public Domain with Automated SSL (DuckDNS):
```caddyfile
# Listen for requests to your domain and automatically configure Let's Encrypt HTTPS
railrush-dev.duckdns.org {
    # Forward requests to the internal frontend container
    reverse_proxy frontend:80
}
```

---

## 4. How to Run It

Inside the directory containing `docker-compose.yml` and `Caddyfile`:

1. **Start all services in background:**
   ```bash
   docker compose up -d
   ```
2. **Check running containers:**
   ```bash
   docker compose ps
   ```
3. **View Caddy logs (useful to watch SSL issuance or errors):**
   ```bash
   docker compose logs -f caddy
   ```
4. **Stop all services:**
   ```bash
   docker compose down
   ```
