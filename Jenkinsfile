pipeline {
    agent any

    stages {
        stage('Clone Repo') {
            steps {
                git url: 'https://github.com/SumukeshN/Freelance-job-portal-Devops.git', branch: 'main'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }
        
        stage('Deploy and Run App') {
            steps {
                dir('backend') {
                    // Stop any existing node process running app.js to prevent port collision
                    bat 'taskkill /F /IM node.exe /T || exit 0'
                    
                    // Run the app in the background
                    bat 'start /B node app.js > server.log 2>&1'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! App is running.'
        }
        failure {
            echo 'Pipeline failed. Check the console output for errors.'
        }
    }
}
