pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO_FRONTEND = "dasund3sh4j4/draftly-frontend"
        DOCKER_HUB_REPO_BACKEND  = "dasund3sh4j4/draftly-backend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        APP_SERVER = "admin@54.92.205.45"
        SSH_KEY = "/var/lib/jenkins/.ssh/app-server.pem"
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

        stage('Deploy to App Server') {
            steps {
                sh """
                ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${APP_SERVER} '
                    export IMAGE_TAG=${IMAGE_TAG}
                    cd draftly &&
                    docker compose pull &&
                    docker compose up -d --force-recreate &&
                    docker image prune -f
                '
                """
            }
        }

        stage('Clean Jenkins Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
