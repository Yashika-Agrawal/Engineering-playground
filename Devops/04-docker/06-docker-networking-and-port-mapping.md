# Docker Networking, Port Mapping & Docker Compose

## 1. What is a "Port"? (Real-World Analogy)

Think of a computer or server like an **apartment building**:
- The **IP address** is the street address of the building: `192.168.252.2`.
- The **Ports** are individual room numbers inside the building:
  - Room `80`: Standard HTTP (unencrypted web traffic).
  - Room `443`: Standard HTTPS (encrypted web traffic).
  - Room `22`: SSH (remote login).
  - Room `3000` / `8080`: Custom rooms for apps.

Only **one application** can live in a room (port) at a time on the same computer. If Nginx is in Room `80`, another app cannot use Room `80`.

---

## 2. What is "Port Mapping" & Why Were We Doing It?

When you run a Docker container:
- It runs inside its own isolated "mini-computer" (container).
- Inside that mini-computer, Nginx is listening on port `80`.
- But your host machine (Mac or Ubuntu VM) **cannot see inside that container** by default.

### What `-p 8080:80` does:
```text
Host VM (Outside)                       Docker Container (Inside)
   [ Port 8080 ]  ════ (Port Forward) ════>  [ Port 80 (Nginx) ]
```
- **Port Mapping (`-p HOST:CONTAINER`)** builds a tunnel from the outside world into the container.
- When someone visits `http://<ip>:8080`, the host VM forwards the traffic to port `80` inside the container.
- **Why we used 8080:** Because port `80` was already taken on the host VM, so we had to pick an unused door number (`8080`).

---

## 3. Why Does the Docker Compose Approach NOT Need Port Mapping for the App?

When we use Docker Compose with a shared **internal network**:

```text
Public Internet / Browser
       │
       ▼ (Hits Ports 80 & 443)
┌────────────────────────────────────────────────────────┐
│ Host VM                                                │
│                                                        │
│  [ Caddy Container ] (Only Caddy has Port Mapping!)    │
│      -p 80:80, 443:443                                 │
│            │                                           │
│            │ (Internal Docker Network: "internal-net") │
│            ▼                                           │
│  [ App Container ]   (NO port mapping to Host!)        │
│    Listens on internal port 80                         │
└────────────────────────────────────────────────────────┘
```

### Why the App container needs NO port mapping:
1. **Private Subnet:** Docker creates a private virtual network (`internal-net`) connecting Caddy and the App container together like two computers plugged into the same Wi-Fi router.
2. **Container DNS Name Resolution:** 
   - Docker gives each container an internal hostname based on its service name.
   - The app service is named `app`.
   - Caddy can talk directly to `http://app:80` using Docker's internal DNS.
3. **Better Security:**
   - The app is completely hidden from the public internet. No one can bypass Caddy and directly access the app container.
   - Only Caddy exposes public ports (`80` and `443`) to the outside world.

---

## 4. Summary: Old Way vs Docker Compose Way

| Feature | Old Way (Standalone `docker run`) | Docker Compose Way |
| :--- | :--- | :--- |
| **How Caddy talks to App** | Via host IP & port (`localhost:8080`) | Via internal container name (`app:80`) |
| **App Port Mapping** | Required (`-p 8080:80`) | **None** (completely private) |
| **Security** | App port is exposed to the host network | Only Caddy's ports (80/443) are exposed |
| **How to run** | Multiple manual `docker run` commands | One command: `docker compose up -d` |
