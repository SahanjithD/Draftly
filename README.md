# Draftly

Draftly is a full-stack blogging application built using the MERN stack (MongoDB, Express, React, Node.js). It includes a complete CI/CD pipeline configuration using Jenkins and is containerized with Docker.

## 🚀 Features

-   **User Authentication**: Register and login securely (JWT-based).
-   **Blogging**: Create, read, and manage stories/posts.
-   **Responsive UI**: Built with React and modern CSS.
-   **Containerized**: Fully dockerized development and production environments.
-   **CI/CD**: specific Jenkins pipeline for automated building and pushing of Docker images.

## 🛠 Tech Stack

-   **Frontend**: React.js, React Router, Axios
-   **Backend**: Node.js, Express.js, Mongoose
-   **Database**: MongoDB
-   **DevOps**: Docker, Docker Compose, Jenkins

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
-   [Docker](https://www.docker.com/products/docker-desktop) & [Docker Compose](https://docs.docker.com/compose/install/)
-   [Node.js](https://nodejs.org/) (if running locally without Docker)
-   Ubuntu on WSL if you want to run the app from a Linux shell on Windows

## ⚡ Getting Started

### Option 1: Using Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SahanjithD/Draftly.git
    cd Draftly
    ```

2.  **Open Ubuntu in WSL and go to the project**
    ```bash
    wsl -d Ubuntu
    cd /mnt/e/Projects/Draftly
    ```

3.  **Start the application (Development Mode)**
    This starts the frontend, backend, and MongoDB database with hot-reloading enabled.
    ```bash
    docker compose -f docker-compose.dev.yml up --build
    ```

4.  **Start the application (Production-Style Mode)**
    This builds the frontend and backend images, then runs them together using the production compose file.
    ```bash
    IMAGE_TAG=localtest docker compose -f docker-compose.prod.yml -p draftlyprod up --build
    ```

5.  **Access the application**
    -   Development frontend: [http://localhost:3000](http://localhost:3000)
    -   Production-style frontend: [http://localhost](http://localhost)
    -   Backend API: [http://localhost:5000](http://localhost:5000)

6.  **Stop the application**
    ```bash
    docker compose -f docker-compose.dev.yml down
    ```

    For the production-style stack:
    ```bash
    IMAGE_TAG=localtest docker compose -f docker-compose.prod.yml -p draftlyprod down
    ```

    If you previously ran a standalone frontend test container, remove it separately:
    ```bash
    docker rm -f draftly-frontend-nginx-test
    ```

### Option 2: Manual Setup

If you prefer to run the services individually on your machine:

#### Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file (see `docker-compose.yml` for required variables like `MONGODB_URI`).
4.  Start the server:
    ```bash
    npm run dev
    ```

#### Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React app:
    ```bash
    npm start
    ```

## 📂 Project Structure

```
Draftly/
├── backend/                # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas (User, Post)
│   ├── routes/             # API routes
│   └── server.js           # Entry point
├── frontend/               # React Application
│   ├── public/             # Static assets
│   └── src/                # React components and pages
├── docker-compose.yml      # Local Docker composition
├── docker-compose.dev.yml  # Development composition with hot reload
├── docker-compose.prod.yml # Production-style composition
└── Jenkinsfile             # CI/CD Pipeline definition
```

## ☁️ AWS Deployment Architecture

This project uses a dedicated AWS infrastructure for CI/CD and production deployment.

```mermaid
graph TD
    subgraph Local_Environment
        Dev[Developer]
        LocalBrowser[Browser]
    end

    subgraph Source_Control
        GitHub["GitHub Repository - main branch"]
    end

    subgraph AWS_Cloud

        subgraph CICD_Server_EC2
            Jenkins[Jenkins Server]
            JCreds[Jenkins Credentials\n- dockerhub-credentials\n- app-server-ssh-key\n- backend-env-file]
        end

        subgraph Registry
            DockerHub[(Docker Hub)]
        end

        subgraph Deployment_Server_EC2
            DockerCompose[Docker Compose]

            subgraph Containers
                Frontend["Frontend Container - Nginx :80"]
                Backend["Backend Container - Node/Express :5000"]
            end

            BackendEnv["backend/.env"]
        end

        Database[(MongoDB Atlas)]
    end

    Dev --> GitHub
    GitHub --> Jenkins
    Jenkins --> JCreds

    Jenkins -- Build & Push --> DockerHub
    Jenkins -- Ansible Deploy over VPC private IP --> DockerCompose
    JCreds -- SSH private key --> Jenkins
    JCreds -- Secret text writes --> BackendEnv

    DockerCompose -- Pull Images --> DockerHub
    DockerCompose -- Start --> Frontend
    DockerCompose -- Start --> Backend

    LocalBrowser -- HTTP 80 --> Frontend
    Frontend --> Backend
    Backend --> Database
    Backend --> BackendEnv
```

### 1. Infrastructure Overview
-   **Jenkins Server**: An EC2 instance dedicated to running the CI/CD pipeline.
-   **Deployment Server**: An EC2 instance that hosts the live application using Docker Compose.

### 2. Server Access
SSH private keys (`.pem` files) for accessing these servers are stored locally at:
`C:\Users\ASUS\.ssh`

To access the servers via SSH:
```bash
ssh -i "C:\Users\ASUS\.ssh\your-key-name.pem" admin@<SERVER_PUBLIC_IP>
```

### 3. Deployment Server Configuration
The deployment server is configured with a `docker-compose.yml` file located at `~/draftly/docker-compose.yml`.

**File Content:**
```yaml
version: "3.9"

services:
  backend:
    image: dasund3sh4j4/draftly-backend:${IMAGE_TAG}
    env_file: .env
    ports:
      - "5000:5000"

  frontend:
    image: dasund3sh4j4/draftly-frontend:${IMAGE_TAG}
    ports:
            - "80:80"
```
*Note: The `${IMAGE_TAG}` variable is populated during the deployment process to ensure the correct version is deployed.*

## 🔄 CI/CD Pipeline

The project includes a `Jenkinsfile` that defines the CI/CD pipeline. The pipeline includes stages for:
1.  Cloning the repository.
2.  Building Docker images for Frontend and Backend.
3.  Pushing images to Docker Hub.
4.  Deploying to the App Server.
5.  Cleaning up Jenkins images.

### 1. Accessing Jenkins
Jenkins is hosted on a dedicated AWS EC2 instance.

1.  **URL**: Navigate to `http://<JENKINS_SERVER_PUBLIC_IP>:8080` in your browser.
2.  **Initial Setup**:
    -   Connect to the server via SSH:
        ```bash
        ssh -i "path\to\your-key.pem" admin@<JENKINS_SERVER_IP>
        ```
    -   Retrieve the initial administrator password:
        ```bash
        sudo cat /var/lib/jenkins/secrets/initialAdminPassword
        # Or if running in Docker:
        docker exec jenkins-container-name cat /var/jenkins_home/secrets/initialAdminPassword
        ```
3.  **Completion**: Enter the password in the web UI, install suggested plugins, and create an admin user.

### 3. Setting Up the Pipeline
1.  **Create a Job**: Click "New Item", enter a name (e.g., "Draftly-Pipeline"), select **Pipeline**, and click OK.
2.  **Configure Pipeline**:
    -   Scroll down to the **Pipeline** section.
    -   Definition: **Pipeline script from SCM**.
    -   SCM: **Git**.
    -   Repository URL: `https://github.com/SahanjithD/Draftly.git`
    -   Branch Specifier: `*/main`
    -   Script Path: `Jenkinsfile`
3.  **Credentials**: 
    -   Go to **Dashboard > Manage Jenkins > Credentials**.
    -   Add a new "Username with password" credential.
    -   **ID**: `dockerhub-credentials` (This must match the ID used in the `Jenkinsfile`).
    -   **Username/Password**: Your Docker Hub login details.
4.  **Run**: Go to the job dashboard and click **Build Now**.

### 4. Docker Hub Artifacts
Once the pipeline completes successfully, the images will be available on Docker Hub:
-   **Frontend**: [dasund3sh4j4/draftly-frontend](https://hub.docker.com/r/dasund3sh4j4/draftly-frontend)
-   **Backend**: [dasund3sh4j4/draftly-backend](https://hub.docker.com/r/dasund3sh4j4/draftly-backend)

## 📖 Documentation

-   **API Documentation**: See `backend/API_DOCUMENTATION.md` for details on available endpoints.
-   **Run Instructions**: See `ReadBeforeRun.md` for specific execution details.
-   **Full Rebuild Guide**: See `REBUILD_RUNBOOK.md` for complete recovery after deleting AWS instances (Terraform, Jenkins, credentials, SSH, env files, and redeploy).

## 🧭 CI/CD Rebuild Runbook (Terraform + Jenkins)

Use this checklist when Jenkins or app server is recreated.

### 1. Infrastructure Source of Truth

1. Provision/update infra only from `terraform/`.
2. Verify current IPs with Terraform outputs:
    ```bash
    cd /mnt/e/Projects/Draftly/terraform
    terraform output
    ```
3. For Jenkins -> App deployment, use app **private IP** in `hosts.ini`.

### 2. Jenkins Credentials Required

Add these once per fresh Jenkins instance under:
`Manage Jenkins -> Credentials -> System -> Global credentials`

1. `dockerhub-credentials`
    - Type: `Username with password`
    - Username: Docker Hub username
    - Password: Docker Hub access token

2. `app-server-ssh-key`
    - Type: `SSH Username with private key`
    - Username: `ubuntu`
    - Private key: full private key content from `~/.ssh/id_rsa`
    - Important: Do **not** paste `id_rsa.pub` (public key)

3. `backend-env-file`
    - Type: `Secret file`
    - File: upload backend `.env` file

### 3. What Jenkinsfile Expects

`Jenkinsfile` stages are:

1. Build frontend and backend Docker images.
2. Push images to Docker Hub.
3. Refresh SSH host fingerprint for app host (`Prepare SSH Host Key`).
4. Run Ansible deploy using:
    - inventory: `hosts.ini`
    - playbook: `deploy.yml`
    - SSH key from Jenkins credential `app-server-ssh-key`
    - backend env content from Jenkins credential `backend-env-file`

### 4. What deploy.yml Does

`deploy.yml` now performs:

1. Ensure `/home/ubuntu/draftly` exists on app server.
2. Clone/update repository into `/home/ubuntu/draftly`.
3. Create `/home/ubuntu/draftly/backend/.env` from Jenkins secret text.
3. Create `/home/ubuntu/draftly/backend/.env` from Jenkins secret file.
4. Run production deployment with:
    ```bash
    docker compose -f docker-compose.prod.yml pull
    docker compose -f docker-compose.prod.yml up -d --force-recreate --no-build
    ```

### 5. Frontend Env Clarification

For current production deployment, no separate Jenkins frontend env secret is required.

Reason:

1. Frontend code calls relative `/api/...` routes.
2. Nginx in `frontend/nginx.conf` proxies `/api/` to `http://backend:5000`.

About `frontend/.env`:

1. It is mainly useful for local/dev React workflows.
2. It is not required as a Jenkins secret in this production Compose design.

### 6. Rebuild Steps (Fast Path)

1. Apply Terraform changes:
    ```bash
    cd /mnt/e/Projects/Draftly/terraform
    terraform plan
    terraform apply
    ```
2. Update `hosts.ini` app host to current app private IP if app instance changed.
3. Push latest repo changes (`Jenkinsfile`, `deploy.yml`, `hosts.ini`).
4. Recreate Jenkins credentials listed above.
5. Run Jenkins pipeline.

### 7. Common Errors and Fixes

1. `Host key verification failed`
    - Cause: app host fingerprint changed.
    - Fix: `Prepare SSH Host Key` stage handles this automatically.

2. `No such identity ... id_rsa` or `error in libcrypto`
    - Cause: wrong/missing SSH key credential.
    - Fix: configure `app-server-ssh-key` with full private key (`id_rsa`), not public key.

3. `No route to host`
    - Cause: wrong app private IP in `hosts.ini`.
    - Fix: update from `terraform output` / `terraform state show aws_instance.app_server`.

4. `backend/.env not found`
    - Cause: env file missing on app server.
    - Fix: ensure Jenkins credential `backend-env-file` exists as Secret file.
