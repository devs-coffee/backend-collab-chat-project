pipeline {
    agent any
    
    stages {
        stage('Clean') {
            steps {
                sh 'printenv'
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']],
                userRemoteConfigs: [[url: 'https://github.com/devs-coffee/backend-collab-chat-project.git']]])
            }
        }

        stage('install') {
            steps {
                echo 'Hello there!'
                sh '''
                    npm install
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    npm run test
                '''
            }
        }

        stage('Update ') {
            steps {
                sh '''
                    npm run build
                    rm -r /var/www/codevert/backend/dist
                    cp -r build/ /var/www/codevert/dist
                    docker service update --force codevert_backend
                '''
            }
        }
    }
}
