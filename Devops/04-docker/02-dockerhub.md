# DockerHub

- Just like we have created docker image and container in last notes, now we need to put this image in our server.
- To put this on server, we need to put this somewhere like github, so for keeping docker image we have DockerHub.
- So we create a repository in Docker Hub, then follow these steps to build and push image:
  - docker build -t < name-of-repo >
  - docker push < name-of-repo >
- After pushing the image in container, we need to automate this, we can't keep up with new images and push them on dockerHub, so we need to include this in our github workflow ci/cd.
