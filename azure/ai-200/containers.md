# Containers

Solving the problem it works on my machine by replicating our local device configs ( bundles runtime, code, tools) to a container which production also use. That's how docker was introduced as a container.

**What's the problem with Virtual Machines?**

It includes a full guest OS for each VM whereas a container uses host OS kernel, it's lightweight.

Software containerization is an OS virtualization method to deploy and run containers without using VM. Containers can run on multiple OS, in hardware, cloud, in VM etc. Dockr lets you develop, run and ship containers

Dockerfile includes libraries, package, language, port etc. On executing this docker file , a docker image is created, which can be shared with other collegues. Once that docker image is executed a docker container is created which has a working replicated environment. Container is image's in memory instance. A container image is immutable, it can only be replaced with another image.
