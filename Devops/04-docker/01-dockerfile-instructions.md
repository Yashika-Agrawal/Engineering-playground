# Docker Fundamentals — Learning Notes

These notes cover the Docker fundamentals we've learned so far, using a **React + Vite frontend** as our practical example. The concepts apply to containerizing many kinds of applications, not just one project.

> **Current status:** We are learning Dockerfile instructions and multi-stage builds. We have not yet built or deployed the example Docker image.

---

## 1. Why containerize an application?

For our practical example, imagine a React frontend that is built on a machine and served by Nginx. Docker gives us a repeatable way to package and run that application:

- Build the React application in a Node.js environment.
- Put the generated production files into an Nginx image.
- Run that image as a container.

We **do not need a backend** to containerize a frontend. A React application can be built and served from a container on its own. The same general Docker concepts apply to backend services too, although their Dockerfiles and runtime requirements will differ.

### A direct deployment vs. a container-based deployment

**Direct deployment example**

```text
CI workflow / developer
    |
    v
Install dependencies and build the frontend
    |
    v
Copy dist/ into the server's web directory
    |
    v
Nginx installed on the server serves the files
```

**Container-based approach we are going to explore**

```text
GitHub Actions
    |
    v
Build Docker image
    |
    v
Run container on Ubuntu VM
    |
    v
Nginx inside the container serves the React files
```

A container-based deployment packages the application and its runtime environment into an image, then runs that image as a container.

---

## 2. What is a Dockerfile?

A `Dockerfile` is a text file containing instructions Docker follows to build an image.

It describes things such as:

- Which base image to start from.
- Which working directory to use.
- Which files to copy into the image.
- Which commands to execute while building.
- Which command should run when a container starts.

A Dockerfile is **not** the container itself. Docker reads it to build a Docker image. A container is a running instance of an image.

### Important Docker terms

| Term | Meaning |
|---|---|
| Dockerfile | Instructions used to build an image |
| Image | Packaged, reusable template containing the application and its required runtime files |
| Container | A running (or stopped) instance created from an image |
| Build context | The files and directories Docker is allowed to access for a build |
| Layer | A reusable result created by Dockerfile build instructions |

---

## 3. Dockerfile instructions we've learned

### `FROM`

Selects the base image for a build stage.

```dockerfile
FROM node:22-alpine AS build
```

- `node` is the image containing Node.js.
- `22` selects the Node.js major version.
- `alpine` uses a lightweight Alpine Linux-based image.
- `AS build` gives this stage the name `build`.

We need Node.js and npm in the first stage to install dependencies and build the React application.

### `WORKDIR`

Sets the working directory inside the image.

```dockerfile
WORKDIR /app
```

Docker uses `/app` as the working directory for subsequent instructions in that stage. If the directory does not exist, Docker creates it.

For example, after this instruction:

```dockerfile
COPY package*.json ./
```

the files are copied into `/app`.

### `COPY`

Copies files from the build context (or another build stage) into the image.

```dockerfile
COPY package*.json ./
```

Here:

- `package*.json` matches files such as `package.json` and `package-lock.json` in the build context.
- `./` means the current working directory inside the image. In our example, that is `/app`.

Another example:

```dockerfile
COPY . .
```

This copies the build-context contents into the current working directory in the image.

**Important:** `COPY` does not mean “copy any file from anywhere on my Mac.” The source must be available inside the Docker build context, unless we are copying from another build stage using `--from`.

### `RUN`

Executes a command while Docker is building the image.

```dockerfile
RUN npm ci
```

This installs the exact dependencies recorded in the lock file. `npm ci` is useful for repeatable builds and expects a compatible `package-lock.json`.

`RUN` happens during image building, not each time a container starts.

### `EXPOSE`

Documents the port that the application in the image is expected to listen on.

```dockerfile
EXPOSE 80
```

This does **not** automatically publish port 80 on the host, open a firewall port, or make the application accessible from the Mac. Port publishing is configured when starting the container with `docker run -p`.

### `CMD`

Specifies the default command to run when a container starts.

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

This starts Nginx in the foreground. Keeping the main process in the foreground allows the container runtime to track it as the container's main process.

---

## 4. Why copy package files before the source code?

Consider this order:

```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

We copy the dependency manifests and install dependencies before copying the rest of the application.

Why?

Docker can reuse previously built layers when the instruction and the files it depends on have not changed.

### Example: only a React component changes

Suppose we edit `src/App.tsx`, but do not change `package.json` or `package-lock.json`.

Docker can reuse the dependency-installation layer:

| Instruction | What happens? |
|---|---|
| `COPY package*.json ./` | Reusable if the dependency files are unchanged |
| `RUN npm ci` | Reusable if its inputs and instruction are unchanged |
| `COPY . .` | Rebuilt because application source changed |
| `RUN npm run build` | Re-executed because the source changed |

If we change `package.json` or `package-lock.json`, Docker must rebuild the dependency-installation layer too.

This is called **Docker layer caching**.

The order of Dockerfile instructions can therefore affect build time.

---

## 5. Multi-stage builds

Our frontend Dockerfile uses two `FROM` instructions. Each `FROM` starts a new build stage.

### Stage 1 — Build the React app

```dockerfile
FROM node:22-alpine AS build
```

This stage uses Node.js to:

1. Set up the working directory.
2. Copy dependency files.
3. Install dependencies.
4. Copy the application source.
5. Run `npm run build`.

Vite generates the production files in the `dist/` directory.

### Stage 2 — Serve the production files

```dockerfile
FROM nginx:alpine
```

This stage uses Nginx to serve the static production files.

It does not need Node.js or the frontend development dependencies.

### Copy output from one stage to another

```dockerfile
COPY --from=build /app/dist /usr/share/nginx/html
```

Breakdown:

- `--from=build`: Use the earlier stage named `build` as the source.
- `/app/dist`: Source directory containing the generated production files.
- `/usr/share/nginx/html`: Destination directory in the current (Nginx) stage.

This copies the generated files from Stage 1 into Stage 2.

For example:

```text
Stage 1: Node build stage

/app/dist/
├── index.html
└── assets/
    ├── index.js
    └── index.css

                 |
                 | COPY --from=build
                 v

Stage 2: Nginx stage

/usr/share/nginx/html/
├── index.html
└── assets/
    ├── index.js
    └── index.css
```

The final image is based on the Nginx stage. The Node.js build environment is not carried into that final image.

This approach is called a **multi-stage build**. It helps keep the final image smaller and avoids including build-time tools that are not needed to serve the application.

---

## 6. Example Dockerfile for a React + Vite frontend

For a frontend project with this structure, place the Dockerfile in the frontend directory, alongside `package.json`:

```text
frontend/
├── src/
├── public/
├── package.json
├── package-lock.json
└── Dockerfile
```

Example Dockerfile:

```dockerfile
# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the application source code
COPY . .

# Generate the production build
RUN npm run build


# Stage 2: Serve the production build using Nginx
FROM nginx:alpine

# Copy the build output from Stage 1 into Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Document the port Nginx listens on
EXPOSE 80

# Keep Nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
```

### Why are there two `FROM` instructions?

- First `FROM`: starts the Node.js build stage.
- Second `FROM`: starts a fresh Nginx stage.

The second stage receives only the generated `dist` files from the first stage. It becomes the final image.

---

## 7. Docker port mapping

Our Nginx process inside the container listens on port `80`.

To access it from the Mac, we publish a host port when starting the container:

```bash
docker run -d -p 3000:80 railrush-frontend
```

The syntax is:

```text
-p HOST_PORT:CONTAINER_PORT
```

So:

- `3000` is the port on the Mac (host).
- `80` is the port inside the container.

We would then open:

```text
http://localhost:3000
```

### What does `EXPOSE 80` do, then?

`EXPOSE 80` documents the container's expected listening port. It does not publish that port to the host.

The `-p 3000:80` option performs the actual port mapping when the container is started.

---

## 8. Our learning environment and next steps

Docker is currently installed on the **Mac**, not inside the Ubuntu VM. That is fine for the first learning stage: we will build and run the example frontend container locally on the Mac.

Planned sequence:

1. Create a `Dockerfile` in the example application's directory.
2. Create a `.dockerignore` file and understand what should be excluded from the build context.
3. Build the image on the Mac.
4. Run the container with port mapping.
5. Inspect the running container, logs and files.
6. Install Docker Engine inside the Ubuntu VM.
7. Deploy the container to the VM.
8. Explore how a CI workflow can build and deploy the Docker image.

---

## 9. Quick revision questions

Try answering these without looking at the explanations above.

1. What is the difference between a Dockerfile, an image and a container?
2. What does `FROM node:22-alpine AS build` do?
3. Why do we copy `package*.json` before `COPY . .`?
4. What does `WORKDIR /app` change?
5. What is the difference between `RUN` and `CMD`?
6. What does `COPY --from=build` mean?
7. Why do we use two build stages for this frontend?
8. Does `EXPOSE 80` publish port 80 on the Mac?
9. In `docker run -p 3000:80`, which port belongs to the host and which belongs to the container?
10. Why can we serve the production React build using Nginx without Node.js in the final image?

---

## Key takeaway

For this React + Vite example, Docker packages the production build together with the Nginx server that serves it.

Node.js is needed in the build stage. Nginx is needed in the final runtime stage. Multi-stage builds let us use both without shipping the entire build environment in the final image.

The broader lesson: a Dockerfile describes how to assemble an image; an image is the packaged artifact; and a container is an instance of that image running with its own process and configuration.
