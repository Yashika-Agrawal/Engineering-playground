# DuckDNS, Caddy Reverse Proxy & Automated SSL (HTTPS)

## 1. Why Are We Doing This? (The Goal)

Until now, our application deployment has two major limitations:

1. **Unencrypted HTTP:** We access the app using `http://<ip>/`. Traffic is plain text (no padlock in browser, no HTTPS security).
2. **IP & Port Exposure:** Users must type raw IP addresses like `http://192.168.252.2/`. If we have multiple apps or services, users would have to remember strange ports like `:3000`, `:5000`, or `:8080`.

### What We Are Building:

- **A Free Public Domain Name:** Using **DuckDNS** (e.g., `yoursubdomain.duckdns.org`) instead of raw IP addresses.
- **A Reverse Proxy:** Using **Caddy** as the single "front door" on the server.
- **Automated SSL/TLS Certificates:** Caddy automatically gets a free, genuine SSL certificate from **Let's Encrypt** and auto-renews it.
- **Load Balancing & Microservices:** Caddy receives traffic on standard port `443` (HTTPS) and securely routes it to our backend Docker containers running in the background.

---

## 2. Architecture: How Traffic Flows

```text
User's Browser (https://yourname.duckdns.org)
                     │
                     ▼ (Standard Port 443 - Encrypted HTTPS)
          ┌──────────────────────┐
          │ Caddy Reverse Proxy  │ ◄── Handles Automatic SSL (Let's Encrypt)
          └──────────┬───────────┘
                     │ (Internal Routing)
                     ▼
          ┌──────────────────────┐
          │   Docker Container   │ (e.g. railrush-container on internal port)
          └──────────────────────┘
```

---

## 3. What is DuckDNS & Why Use It?

- **What it is:** DuckDNS is a completely free Dynamic DNS (DDNS) service that provides subdomains under `.duckdns.org`.
- **Why we need it:**
  - Let's Encrypt (the Certificate Authority that gives free SSL certificates) **cannot issue certificates to private local IPs** like `192.168.252.2`.
  - It **requires a real domain name** (like `xxxx.duckdns.org`) to verify ownership and issue a trusted SSL certificate.

---

## 4. What is Caddy & Why Choose It Over Nginx?

- **What it is:** Caddy is an open-source, modern web server and reverse proxy written in Go.
- **Why Caddy over Nginx for SSL:**
  - With Nginx, enabling HTTPS requires installing `certbot`, editing complex config files, setting up cron jobs for renewals, and configuring port redirects.
  - With Caddy, **automatic HTTPS is on by default**. You write a 3-line `Caddyfile`, and Caddy automatically fetches the SSL certificate, configures HTTPS, redirects all HTTP traffic to HTTPS, and renews the certificate before it expires.

### Simple `Caddyfile` Example:

```caddyfile
yourname.duckdns.org {
    reverse_proxy localhost:8080
}
```

---

## 5. Verification: Proof That Caddy is Reverse Proxying the Traffic

When visiting `http://railrush-dev.duckdns.org`, we can inspect the browser **Developer Tools (Network Tab)** to verify that requests are indeed passing through Caddy before reaching our Nginx frontend container:

### Evidence from Network Response Headers:

- **`Server: nginx/1.31.10`**: The origin server running inside our `frontend` Docker container that serves the React build.
- **`Via: 1.1 Caddy`**: Proof that **Caddy intercepted the client request, acted as the reverse proxy gateway, and forwarded it to the frontend container!**


![Caddy Reverse Proxy Proof](../assets/caddy-reverse-proxy-response.png)

---

## 6. How Automated SSL / HTTPS Works in Production vs Local VM

### A. How It Works in Production (The Standard Industry Setup)

In a real production environment on AWS, GCP, or a VPS (e.g. DigitalOcean, Hetzner):
1. **Public Static IP:** The server has a publicly routable IP address (e.g., `54.210.12.34`).
2. **DNS A Record:** Your domain (e.g., `app.mycompany.com`) points directly to this public IP in DNS.
3. **The Caddyfile:**
   ```caddyfile
   app.mycompany.com {
       reverse_proxy frontend:80
   }
   ```
4. **Zero-Config Auto-TLS:**
   - Caddy contacts **Let's Encrypt** via the **ACME protocol**.
   - Let's Encrypt connects back to `app.mycompany.com:80` (the HTTP-01 challenge) to verify ownership.
   - Once verified, Let's Encrypt issues a publicly trusted SSL certificate.
   - Caddy binds to port `443` (HTTPS) and automatically redirects all HTTP port `80` traffic to HTTPS with zero manual setup.

---

### B. How We Handle It in Our Local VM (`tls internal`)

Why do we need a slight adjustment for a local lab VM?
- **The Problem:** Our Multipass VM has a **private local IP** (`192.168.252.2`). Let's Encrypt servers on the public internet cannot reach into our laptop to perform the HTTP-01 challenge.
- **The Solution (`tls internal`):**
  ```caddyfile
  railrush-dev.duckdns.org {
      tls internal
      reverse_proxy frontend:80
  }
  ```
- **What `tls internal` does:**
  - Caddy acts as its **own local Certificate Authority (CA)**.
  - It generates real TLS encryption keys and serves traffic over HTTPS on port `443`.
  - It allows us to test the exact same reverse-proxy HTTPS flow locally without needing a public static IP or router port forwarding.
  *(Note: In production with a public IP, you simply remove `tls internal`, and Caddy immediately switches to genuine Let's Encrypt certificates).*

