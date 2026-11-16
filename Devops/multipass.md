# Deploying wiTH MultiPass

multipass will be used to make ci cd pipelines, make VM , deploy in linux locally.

`multipass list` This command will help to list down all the VMs, initially it will sh no instances.

`multipass launch --name devops-vm --cpus 2 --memory 2G --disk 10G ` - This command will create a virtual instance by default ubuntu machine, here name is devops-vm with 2 cpu, memory 2gb, disk 10gb.

`multipass shell devops-vm` - This goes inside our instance created

Add SSH public key generated from github reference docs from macOS to ubuntu machine inside authorized_keys folder.
