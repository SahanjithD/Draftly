# Draftly Rebuild Runbook

This guide explains how to recreate and restore the full Draftly deployment if EC2 instances are deleted.

## Scope

This runbook covers:

1. Recreating AWS infrastructure with Terraform
2. Restoring Jenkins on a fresh server
3. Reconnecting Jenkins pipeline deployment to the app server
4. Handling SSH keys and host key verification
5. Managing backend and frontend environment variables
6. Running and validating the deployment end-to-end

## Architecture Recap

1. Jenkins server EC2 (build and deploy controller)
2. App server EC2 (runs frontend and backend containers)
3. Docker Hub (stores built images)
4. Ansible (deploys from Jenkins server to app server)

## Prerequisites

1. AWS credentials configured in WSL
2. Terraform installed in WSL
3. Local SSH key pair available:
   1. Private key: ~/.ssh/id_rsa
   2. Public key: ~/.ssh/id_rsa.pub
4. Access to Jenkins UI on the new Jenkins server
5. GitHub repo access to [Draftly](README.md)

## 1) Recreate Infrastructure With Terraform

Run from WSL:

```bash
cd /mnt/e/Projects/Draftly/terraform
terraform init
terraform plan
terraform apply
```

Confirm outputs:

```bash
terraform output
```

You should get:

1. app_server_public_ip
2. jenkins_server_public_ip
3. jenkins_url

Get app private IP (used by Ansible inventory):

```bash
terraform state show aws_instance.app_server | grep private_ip
```

## 2) Update Inventory Host

Update [hosts.ini](hosts.ini) with current app private IP and ubuntu user.

Expected format:

```ini
[app_servers]
172.31.x.x ansible_user=ubuntu
```

Do not hardcode a local key path in inventory. Jenkins passes SSH key at runtime via credentials.

## 3) Jenkins First-Time Setup (Fresh Server)

Open Jenkins URL from Terraform output and finish setup wizard.

Create a Pipeline job:

1. Pipeline script from SCM
2. Git URL: https://github.com/SahanjithD/Draftly.git
3. Branch: main
4. Script path: Jenkinsfile

Trigger behavior:

1. Pipeline is configured as push-triggered (`githubPush()`).
2. SCM polling fallback is intentionally disabled.

Configure GitHub webhook:

1. URL: http://<jenkins_server_public_ip>:8080/github-webhook/
2. Content-Type: application/json
3. Event: Just the push event
4. After changing Jenkinsfile, run one manual build once so Jenkins reloads pipeline config.

## 4) Jenkins Credentials You Must Add

Add these in Jenkins global credentials.

### 4.1 Docker Hub

1. Kind: Username with password
2. ID: dockerhub-credentials
3. Username: Docker Hub username
4. Password: Docker Hub access token

### 4.2 App SSH key

1. Kind: SSH Username with private key
2. ID: app-server-ssh-key
3. Username: ubuntu
4. Private key: full content of ~/.ssh/id_rsa

Important:

1. Do not paste id_rsa.pub (public key)
2. The key must match the EC2 key pair used at instance launch

### 4.3 Backend env file

1. Kind: Secret file
2. ID: backend-env-file
3. File: upload backend .env

## 5) Environment Files Strategy

### Backend env

1. backend/.env is not committed to git
2. Pipeline injects backend env using Jenkins secret file credential backend-env-file
3. Ansible writes it to /home/ubuntu/draftly/backend/.env during deploy

### Frontend env

Current production flow does not require a Jenkins frontend env secret.

Reason:

1. Frontend uses relative /api calls
2. [frontend/nginx.conf](frontend/nginx.conf) proxies /api to backend:5000

frontend/.env is mostly for local development workflows.

## 6) SSH and Host Key Behavior

Pipeline has a Prepare SSH Host Key stage in [Jenkinsfile](Jenkinsfile).

It automatically:

1. Reads app host from [hosts.ini](hosts.ini)
2. Removes old known_hosts entry
3. Scans and adds current app host key

This prevents Host key verification failed errors after instance replacement.

## 7) Deploy Flow

On every pipeline run:

1. Build frontend and backend images
2. Push images to Docker Hub
3. Refresh SSH known host key
4. Run Ansible deploy against app server private IP
5. Clone/update repo on app server
6. Write backend .env from Jenkins secret
7. Run docker compose production deploy

## 8) Validation Checklist

After a successful run:

1. App URL opens: http://<app_server_public_ip>/home
2. API responds on http://<app_server_public_ip>:5000
3. Jenkins deploy stage is green

Optional app server checks:

```bash
ssh -i ~/.ssh/id_rsa ubuntu@<app_server_public_ip>
cd /home/ubuntu/draftly
docker compose -f docker-compose.prod.yml ps
docker logs $(docker ps --format '{{.Names}}' | head -n 1)
```

## 9) Common Errors and Fixes

1. Permission denied (publickey)
   1. Wrong SSH key in app-server-ssh-key
   2. Fix: use full private key ~/.ssh/id_rsa

2. Host key verification failed
   1. App host key changed
   2. Fix: Prepare SSH Host Key stage should resolve automatically

3. No route to host
   1. Wrong app private IP in [hosts.ini](hosts.ini)
   2. Fix: refresh from Terraform state

4. backend/.env not found
   1. Missing Jenkins secret file backend-env-file
   2. Fix: create/update credential by uploading backend .env file

5. InvalidKeyPair.NotFound
   1. Terraform references non-existing key pair name
   2. Fix: either create key pair in AWS or use Terraform-managed key from ~/.ssh/id_rsa.pub

## 10) Rebuild Quick Commands

```bash
# Infra
cd /mnt/e/Projects/Draftly/terraform
terraform init
terraform apply

# Verify app private IP for inventory
terraform state show aws_instance.app_server | grep private_ip
```

Then:

1. Update [hosts.ini](hosts.ini)
2. Ensure Jenkins credentials are present
3. Run Jenkins pipeline

## 11) Security Notes

1. Never commit private keys
2. Never commit backend .env
3. Use Docker Hub access token instead of password
4. Restrict AWS security group CIDRs to known IPs where possible
5. Jenkins port 8080 may be opened to `0.0.0.0/0` for webhook delivery; prefer HTTPS reverse proxy and tighter controls after validation

## 12) When Recreating Only One Server

1. If only app server is recreated:
   1. Update app private IP in [hosts.ini](hosts.ini)
   2. Re-run pipeline

2. If only Jenkins server is recreated:
   1. Reinstall/reconfigure Jenkins job
   2. Re-add Jenkins credentials
   3. Re-run pipeline
