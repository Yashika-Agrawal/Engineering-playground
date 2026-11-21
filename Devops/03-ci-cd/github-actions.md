# Github Actions for CI/CD

Make a folder name .github in your project root directory, inside that make a folder named workflows, inside workflows have a .yml file which github will treat as ci/cd.

Conf. inside .yml file:

- name: any name you can give which will be displayed as a workflow on github actions.

```
on:
    push:
        branches:
            -main
```

- Above conf tells it when to run ci/cd, when someone pushed on main branch.

```
jobs: 
    deploy:
        runs-on: ubuntu-latest
     steps:
         - name: Checkout code
          uses: actions/checkout@v4

         - name: Deploy on ExCloud
           uses: appleboy/ssh-action@v1.0.3

         - with:
               host: 210.79.168
               username: ubuntu
               key: Private_key
               script: cd /home/ubuntu/railrush
               git pull
               npm run build
               npm install
```

- for private_key we will create a private key for github , and put that into secrets and variables->actions, into github, and give location of it here. Ex: ${{secrets.Private_key}}
- Put the public key generated for github too in your ubuntu instance too.
- Commit your local changes and you can see in Actions tab of github, where your worksflows will be present.

**Dockerize your container**

- Create a Dockerfile, with exact name as this no extension









\
