# Azure Key Vault

Azure key vault is a cloud service used to securely store and manage sensitive info. Applications get this info at runtime.

Lets suppose youw ant to store api key instead of hardcoding in env variables you can store it in Azure key vault securely. the authentication mechanism is eneded to get that api key from key vault, using managed identity.

**Hands on**

- Search key vaults in services -> Create-> Fill in the details for configuration -> Deploy

Now to check go to Objects -> Secrets , now to add our secrets here we don't have permissions to add it.

So go to Access Control (IAM) service, role assignment will on user account, and the role will be key vault's administrator's role.

Go to Add role assignment -> search for key vault administrator -> create and select members -> review and assign

Now you can go to secrets -> create a secret

Now go to IAM again -> Search for key vault secrets user -> Generate system assigned managed identity and add that in role assignment -> Assign

Azure api key is now having source as key vault.
