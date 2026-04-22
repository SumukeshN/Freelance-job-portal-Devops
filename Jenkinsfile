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
                echo 'Code is up to date. App is already running on port 3000.'
                echo 'In production (Linux EC2), nohup node app.js would restart here.'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline SUCCESS! All stages passed.'
        }
        failure {
            echo '❌ Pipeline FAILED. Check Console Output for errors.'
        }
    }
}
