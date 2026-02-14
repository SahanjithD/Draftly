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

        stage('Deploy to App Server') {
        steps {
            sh '''
            ssh -i /home/admin/.ssh/app-server.pem -o StrictHostKeyChecking=no admin@54.92.205.45 "
                cd draftly &&
                docker compose pull &&
                docker compose up -d --force-recreate
            "
            '''
            }
        }

        

        stage('Clean up') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
