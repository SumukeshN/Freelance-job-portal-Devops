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
                    sh 'npm install'
                }
            }
        }
        
        stage('Deploy and Run App') {
            steps {
                dir('backend') {
                    // Stop any existing node process running app.js to prevent port collision
                    sh 'pkill -f "node app.js" || true'
                    
                    // Run the app in the background
                    sh 'nohup node app.js > server.log 2>&1 &'
                }
            }
        }
    }
}
