# DevOps Learning Notes

My hands-on DevOps learning journey, covering Linux, deployment, CI/CD, automation, and cloud infrastructure.

These notes contain concepts, practical implementations, troubleshooting experiences, and interview revision questions.

## Topics

### 1. Fundamentals & Networking
* [Networking and Servers](./01-fundamentals/networking-and-servers.md) — Localhost, DNS, NAT, ports, and port forwarding.

### 2. Local Lab & Linux VM Setup
* [Multipass VM & Nginx Deployment](./02-local-lab/multipass-setup.md) — Local Ubuntu VM setup, Linux commands, building RailRush, Nginx configuration, and serving the app.
* [Cloud VMs & Remote SSH](./02-local-lab/cloud-vms-and-ssh.md) — VM instances, security groups, and SSH key pairs (`authorized_keys`).

### 3. GitHub Actions and CI/CD
* [Intro to CI/CD](./03-ci-cd/intro-to-ci-cd.md) — Core CI/CD concepts and pipeline stages.
* [GitHub Actions with Excloud](./03-ci-cd/github-actions-excloud.md) — Learning from classroom deployment using GitHub-hosted runners and SSH.
* [GitHub Actions with Self-Hosted Runner](./03-ci-cd/github-actions-self-hosted-runner.md) — Setting up a local Ubuntu VM as a self-hosted runner and automating RailRush deployment.

### 4. Docker, Containerization & Reverse Proxy
* [Dockerfile Instructions & Multi-Stage Builds](./04-docker/01-dockerfile-instructions.md) — Multi-stage builds, Node.js compilation, and minimal Nginx runtime packaging.
* [Docker Hub & Automated Registry Push](./04-docker/02-dockerhub.md) — Container registries, image tagging, and GitHub Actions PAT authentication.
* [Multi-Platform Architecture & Server Deployment](./04-docker/03-multiplatform-and-server-deployment.md) — AMD64 vs ARM64 builds (QEMU + Buildx), installing Docker Engine on Ubuntu, and container port mapping.
* [Visual CI/CD Docker Deployment Flow](./04-docker/04-cicd-docker-deployment-flow.md) — End-to-end Mermaid diagram and visual cheat sheet from commit push to live container.
* [DuckDNS, Caddy & Automated SSL](./04-docker/05-duckdns-caddy-and-ssl.md) — Free dynamic DNS, why Caddy beats Nginx for auto-HTTPS, and production Let's Encrypt vs local VM.
* [Docker Networking & Port Mapping](./04-docker/06-docker-networking-and-port-mapping.md) — What ports are, why single containers need port mapping, and how internal bridge networks hide apps from the public internet.
* [Docker Compose & Caddy Setup](./04-docker/07-docker-compose-and-caddy-setup.md) — Line-by-line breakdown of `docker-compose.yml`, `Caddyfile`, and zero-downtime updates in CI/CD.
* [HTTPS Verification & Reverse Proxy Headers](./04-docker/08-https-verification-and-proxy-headers.md) — Browser certificate viewer proof, HTTP/3 network headers, and why `X-Forwarded-*` / `Host` headers are used.

## Learning Philosophy

I prefer understanding the underlying concepts before automating them.

For each topic, I document:

* What problem does it solve?
* How does it work?
* Why did I choose this approach?
* What commands and configurations did I use?
* What errors did I encounter, and how did I debug them?
* How would I explain this in a technical interview?

## Hands-on Project

**RailRush** — Used as the practical application for learning Linux deployment and GitHub Actions CI/CD.
