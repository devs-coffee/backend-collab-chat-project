pipeline {
    agent any 
    stages {
        stage('install') {
            steps {
                git(
                    url: "https://github.com/devs-coffee/backend-collab-chat-project",
                    branch: "main",
                    changelog: true,
                    poll: true
                )
                echo "Are we done?"
            }
        }
    }
}