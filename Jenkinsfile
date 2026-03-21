pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO_FRONTEND = "dasund3sh4j4/draftly-frontend"
        DOCKER_HUB_REPO_BACKEND  = "dasund3sh4j4/draftly-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/SahanjithD/Draftly.git'
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Test Backend') {
                    steps {
                        sh '''
                        docker run --rm \
                          -v "$WORKSPACE/backend":/app \
                          -w /app \
                          node:18-alpine \
                          sh -c "npm install && npm test"
                        '''
                    }
                }
                stage('Test Frontend') {
                    steps {
                        sh '''
                        docker run --rm \
                          -v "$WORKSPACE/frontend":/app \
                          -w /app \
                          -e CI=true \
                          node:18-alpine \
                          sh -c "npm ci && npm test"
                        '''
                    }
                }
            }
        }

        stage('Build Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        sh """
                        docker build \
                          -t ${DOCKER_HUB_REPO_FRONTEND}:${IMAGE_TAG} \
                          ./frontend
                        """
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        sh """
                        docker build \
                          -t ${DOCKER_HUB_REPO_BACKEND}:${IMAGE_TAG} \
                          ./backend
                        """
                    }
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push ${DOCKER_HUB_REPO_FRONTEND}:${IMAGE_TAG}
                    docker push ${DOCKER_HUB_REPO_BACKEND}:${IMAGE_TAG}
                    docker logout
                    '''
                }
            }
        }

        stage('Prepare SSH Host Key') {
            steps {
                sh '''
                APP_HOST=$(tail -n +2 hosts.ini | awk 'NF {print $1; exit}')
                mkdir -p "$HOME/.ssh"
                touch "$HOME/.ssh/known_hosts"
                ssh-keygen -R "$APP_HOST" -f "$HOME/.ssh/known_hosts" || true
                ssh-keyscan -H "$APP_HOST" >> "$HOME/.ssh/known_hosts"
                chmod 700 "$HOME/.ssh"
                chmod 600 "$HOME/.ssh/known_hosts"
                '''
            }
        }

        stage('Deploy to App Server') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'app-server-ssh-key',
                        keyFileVariable: 'SSH_KEY'
                    ),
                    file(
                        credentialsId: 'backend-env-file',
                        variable: 'BACKEND_ENV_FILE'
                    )
                ]) {
                    sh "ansible-playbook -i hosts.ini --private-key '${SSH_KEY}' deploy.yml --extra-vars 'IMAGE_TAG=${IMAGE_TAG}'"
                }
            }
        }

        stage('Clean Jenkins Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
