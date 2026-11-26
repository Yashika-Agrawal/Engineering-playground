# SSL vs TLS (Secure Sockets Layer vs Transport Layer Security)

## 1. What is SSL vs TLS?

- **SSL (Secure Sockets Layer):** The original encryption protocol created by Netscape in the 1990s (SSL 1.0, 2.0, 3.0). It is ancient, has known security vulnerabilities (like POODLE), and is officially deprecated.
- **TLS (Transport Layer Security):** The modern, secure successor to SSL. The modern internet exclusively uses TLS (specifically TLS 1.2 and TLS 1.3).
- **Why people still say "SSL":** It's just a legacy habit. When anyone today talks about an "SSL Certificate" or "SSL Handshake", they actually mean **TLS**.

---

## 2. What Do SSL / TLS Do? (The 2 Core Jobs)

Every time you open `https://...`, TLS performs two critical jobs:

1. **Encryption (Data Privacy):**
   - Plain HTTP sends data as clear text. Anyone on your local Wi-Fi router or ISP can read passwords, cookies, or headers.
   - TLS encrypts the communication channel between the client (browser) and the server using cryptographic symmetric keys negotiated during the TLS handshake.
2. **Authentication (Server Identity):**
   - Proves to the user that they are truly talking to your genuine server and not an impostor or attacker intercepting traffic (Man-In-The-Middle attack).
   - This identity is verified using digital certificates signed by a trusted Certificate Authority (CA) like Let's Encrypt.

---

## 3. How HTTPS Relates to TLS

```text
HTTPS = HTTP + TLS Encryption

[ HTTP Application Data (HTML / JSON / Headers) ]
                     │
                     ▼
       [ TLS Encryption Layer ]  <── Handshake, Certificates, Keys
                     │
                     ▼
           [ TCP Port 443 ]
```

- When web traffic runs without TLS, it uses standard **TCP port 80** (`http://`).
- When web traffic is wrapped inside TLS encryption, it uses standard **TCP port 443** (`https://`).

---

## 4. Why We Used `tls internal` in Local DevOps Environments

- **Production:** In production with a public IP, reverse proxies like Caddy automatically contact a public Certificate Authority (Let's Encrypt) to issue globally trusted TLS certificates.
- **Local Lab / Private IPs:** When working with local VMs or private networks (`192.168.x.x`), public CAs cannot connect into private networks to verify ownership.
- **`tls internal`:** Tells the web server / proxy to act as its own local Certificate Authority. It issues a real cryptographic TLS certificate locally, allowing full end-to-end HTTPS testing on port `443` without needing a public domain or router port-forwarding.
