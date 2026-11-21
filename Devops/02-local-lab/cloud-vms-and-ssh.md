# Intro to CI/CD Pipeline

We need a set of scripts to automate our workflow of building, deployment, maintaining and monitoring our application. Instead of doing it manually everytime.

Continous Integration and continuous deployment (CI/CD).

Instances: Server or a virtual machine

To launch a instance you need to give:

- name of instance
- SSH ( Secure shell) : We need a secure way to send data to our instance ( virtual machine ). We can connect via asymmetric encryption, where we have a private key and one public key on server, then we can make SSH connection so that i can run commands in my server remotely. ( Optional )
- Root password:
- Security Groups: It's like a firewall what traffic can come in?
- Machine: What kind of machine OS you want like ubuntu, linux etc.
- Root Volume(EBS): Hard disk of machine, how much ? 25 gb?
- Instance Type: what kind of machine needed? 2 CPU, 4GB RAM, Pricing depends

After the instance is launched, you get a public IP.

Now to make a SSH connection you need to create a public and private key to make a secure connection to machine, and to access it. public key to put on instance and private to my machine.

To generate a new SSH key, refer github docs.

Now in .ssh folder you have you public and private key. 2 files with id_ed25519.pub and id_ed25519, .oub is the public key file.

Now to add this on server also you need to access server which can be done only via ssh , so for this deadlock we have admin portal with option to Connect, which lets us connect with our machine.

Add public key generated to instance in ssh folder, create a folder authorize_keys and add inside it.
