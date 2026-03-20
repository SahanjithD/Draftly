pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO_FRONTEND = "dasund3sh4j4/draftly-frontend"
        DOCKER_HUB_REPO_BACKEND  = "dasund3sh4j4/draftly-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/SahanjithD/Draftly.git'
            }
        }

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
                APP_HOST=$(awk 'NF && $1 !~ /^\[/' hosts.ini | head -n1 | awk '{print $1}')
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
                sh "ansible-playbook -i hosts.ini deploy.yml --extra-vars 'IMAGE_TAG=${IMAGE_TAG}'"
            }
        }

        stage('Clean Jenkins Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
