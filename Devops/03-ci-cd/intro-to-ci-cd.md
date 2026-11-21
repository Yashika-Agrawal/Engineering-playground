# Intro to CI/CD Pipeline

Continuous Integration and Continuous Deployment (CI/CD) automates the workflow of building, testing, deploying, maintaining, and monitoring applications, removing manual and error-prone deployment steps.

#### Core Concepts

- **Continuous Integration (CI)**: Automatically build and run automated tests every time code is committed/pushed to a repository. Ensures issues are caught early before merging into main branches.
- **Continuous Delivery**: Ensures the codebase is in a deployable state at all times, with deployment to production requiring manual approval.
- **Continuous Deployment (CD)**: Automatically deploys passing changes directly to production environments without manual intervention.

Examples of CI: Github Actions, AWS CodeBuild, Jenkins etc

These all need configuraiton like source, event ( when to trigger? ) and steps ( what needs to performed)
