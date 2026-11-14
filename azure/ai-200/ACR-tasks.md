# Building Images with ACR Tasks

What if you don't wanto run those docker commands everytime you want to push a image to ACR ? What if you don't want docker running in the background?

With the help of ACR tasks we can build, run , test, and push images directly to ACR without the need of docker running in background.

"az acr build --registry < registry name > --image < image > :< tag-name > .", this command will use ACR tasks to build and piush image to ACR.

**Lock images**

az acr repository update
--name $ACR_NAME
--image < image name > : < tag >
--write-enabled false

**Unlock images**

az acr repository update
--name $ACR_NAME
--image < image name > : < tag >aoaipythonapp:v
--write-enabled true

##### App Service Plan

- Before we make our app go live, we need set of compute resources needed for app to run. Like type of OS, region, number of VMs, size of VMs, and pricing.

##### Azure web app instance

Its a publically accessible URL, or a running copy of your application. On scaling out, Azure app can create multiple instances of your applications, traffic is automatically distributed using Azure load balancing

**Managed Identities in Azure web apps**

Credential management is big problem for security we can't sotre them as hardcoded which is vulnerable to attackers. Credentials needs to be rotated, updated, protected

Supose from your azure web app you want to access storage account, you should not go from API keys route, it should go from managed identity, it has the right set of permissions which let it access storage account. No burden of rotating api keys.

Two types of managed identities:

1. System Assigned: Tied to azure resource, will be deleted with it, one identity per azure resource, cannot be reused across resources, single app requires azure resource acesss.
2. User Assigned: Independent of azure resource, multiple resources can be attached with one identity, can be reused across web apps, containers, functions etc, multiple apps requires same permissions ( centralized RBAC )

This is useful when we create ACR, by giving System Assigned Managed Identity to protect from pulling, pushing images to ACR.
