# Intro to CI/CD Pipeline

Continuous Integration and Continuous Deployment (CI/CD) automates the workflow of building, testing, deploying, maintaining, and monitoring applications, removing manual and error-prone deployment steps.

---

## Core Concepts

- **Continuous Integration (CI)**: Automatically build and run automated tests every time code is committed/pushed to a repository. Ensures issues are caught early before merging into main branches.
- **Continuous Delivery**: Ensures the codebase is in a deployable state at all times, with deployment to production requiring manual approval.
- **Continuous Deployment (CD)**: Automatically deploys passing changes directly to production environments without manual intervention.

---

## Typical CI/CD Pipeline Stages

1. **Source / Trigger**: Code pushed to repository or Pull Request opened.
2. **Build**: Compile source code, install dependencies, package assets / container images (Docker).
3. **Test**: Run unit tests, integration tests, security scanners, and linters.
4. **Deploy**: Deploy the artifact/container to a server, VM, or cluster (e.g., via SSH, container registries, Kubernetes, or serverless platforms).
5. **Monitor & Health Check**: Verify that services start up successfully and endpoints respond with 200 OK.
