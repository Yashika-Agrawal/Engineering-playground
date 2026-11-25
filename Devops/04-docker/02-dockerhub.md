# DockerHub

- Just like we have created docker image and container in last notes, now we need to put this image in our server.
- To put this on server, we need to put this somewhere like github, so for keeping docker image we have DockerHub.
- So we create a repository in Docker Hub, then follow these steps to build and push image:
  - docker build -t < name-of-repo >
  - docker push < name-of-repo >
- After pushing the image in container, we need to automate this, we can't keep up with new images and push them on dockerHub, so we need to include this in our github workflow ci/cd.

## How GitHub Actions Authenticates with DockerHub

- When GitHub Actions runs, it uses a fresh machine every time, so it is **not** logged into our DockerHub account.
- We cannot write our DockerHub password directly in the workflow file (unsafe). Instead, we use a **Personal Access Token (PAT)**.

### Steps we did:
1. **Create a token in DockerHub:**
   - DockerHub → Account Settings → Personal Access Tokens → Generate new token.
   - Give it **Read & Write** permission *(Read-only will give `401 Unauthorized` when pushing)*.
2. **Save username & token in GitHub:**
   - GitHub Repo → Settings → Secrets and variables → Actions.
   - Add `DOCKERHUB_USERNAME` under **Variables** (not secret, just your username).
   - Add `DOCKERHUB_TOKEN` under **Secrets** (hidden/masked in logs).
3. **Add login step in `.github/workflows/frontend.yml`:**
   ```yaml
   - name: Login to Docker Hub
     uses: docker/login-action@v4
     with:
       username: ${{ vars.DOCKERHUB_USERNAME }}
       password: ${{ secrets.DOCKERHUB_TOKEN }}
   ```
- Now GitHub Actions logs into DockerHub using these saved values, builds the image, and pushes it automatically on every push to `main`.
