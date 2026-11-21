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
