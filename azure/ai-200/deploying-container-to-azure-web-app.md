# Deploying container toAzure Web App

Search for Azure web APP, you will see "App Services" -> Create Web App

- While Creating web app, select Managed Identity so that it will be managed by system for autorization keys. Fill in the details like container/ web app, name of web app, name of image, tag, port etc.
- After deploying this azure web app, you have azure web app instance created and azure wbe service plan created automatically, with user assigned managed identity.
- On opening th web app you see, Default domain which is the publically accessible URL, append the endpoint you want to access, like public-domain.net/< endpoint >.
- On making request to this public domain now gives us response :)

To chnage version and all, go to Deployment -> Deployment Center -> Change version etc. Go to Azure wbe app and click restart. Deployment center also contains logs to debug the web app.

### Configure container health check

Instead of having a hardcoded health endpoint in our application we can configure this health endpoint in azure container.

Monitoring -> Health check -> check health check -> give path ("/health") -> load balancing threshold - 10 minutes ( if the status is unhealth for 10 minutes it wil be removed from load balancer and added back once its healthy to recieve traffic) -> Save

check instance tab, you will see Status - Healthy there!

### Working with env variables

curently you are writting your env variables and secrets in .env file instead of that we can make it dyanmic when you run the image.

ex: os.environ.get() which loads env variables on demand instead of os.getenv() in app.py file. Now this will take env variables which are in azxure web app instance.

Go in settings -> eng variables -> edit env variables -> add , add the env variables with key value pair here, for the app.
