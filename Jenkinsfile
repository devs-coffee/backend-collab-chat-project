pipeline {
    agent any
    
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
