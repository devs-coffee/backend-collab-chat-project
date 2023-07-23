pipeline {
    agent any
    
    tools {
        nodejs 'NodeJs18'
    }

    stages {
        stage('Clean') {
            steps {
                sh 'printenv'
                cleanWs()
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
    }
}
