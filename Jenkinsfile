pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO_FRONTEND = "dasund3sh4j4/draftly-frontend"
        DOCKER_HUB_REPO_BACKEND = "dasund3sh4j4/draftly-backend"
    }

    stages {

        stage('Clone repository') {
            steps {
                git branch: 'main', url: 'https://github.com/SahanjithD/Draftly.git'
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_HUB_REPO_FRONTEND:latest ./frontend'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_HUB_REPO_BACKEND:latest ./backend'
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $DOCKER_HUB_REPO_FRONTEND:latest
                    docker push $DOCKER_HUB_REPO_BACKEND:latest
                    docker logout
                    """
                }
            }
        }

        stage('Create Backend .env File') {
            steps {
                withCredentials([file(credentialsId: 'backend-env-file', variable: 'ENV_FILE')]) {
                    sh 'cat $ENV_FILE > ./backend/.env'
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                sh 'docker-compose -f docker-compose.yml up -d'
            }
        }
        

        stage('Clean up') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
