# Freelance Job Portal: Deployment & Viva Guide

This document contains everything needed to push your code, deploy it to AWS, and answer Viva questions successfully.

## 1. Pushing Code to Git

Run these commands in the terminal within your project folder:

```bash
# Initialize a new git repository (if not already done)
git init

# Add all files to staging
git add .

# Commit your changes
git commit -m "Initial commit: Complete Freelance Job Portal Project"

# Link your local repo to the GitHub repository
git remote add origin https://github.com/SumukeshN/Freelance-job-portal-Devops.git

# Push the code (use the 'main' or 'master' branch as appropriate)
git branch -M main
git push -u origin main
```

## 2. AWS EC2 Deployment Guide (Amazon Linux)

Follow these steps exactly to run your app on your new EC2 instance.

### Step A: Connect to EC2
Using your terminal or command prompt, connect using the SSH key pair you specified when creating the instance:
```bash
ssh -i /path/to/your/key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>
```

### Step B: Install Node.js and Git
Amazon Linux uses `dnf` (the successor to `yum`). Run these commands:
```bash
# Update installed packages
sudo dnf update -y

# Install git
sudo dnf install git -y

# Install Node.js
sudo dnf install nodejs -y

# Verify installations
node -v
git --version
```

### Step C: Clone the Repository & Run
```bash
# Clone the repository
git clone https://github.com/SumukeshN/Freelance-job-portal-Devops.git

# Navigate into the backend directory
cd Freelance-job-portal-Devops/backend

# Install the necessary dependencies
npm install

# Run the project as a background process using nohup
nohup node app.js > server.log 2>&1 &
```
*Note: Your application is now running on port 3000.*

### Step D: Open Port 3000 in Security Group
1. Go to your AWS EC2 Console.
2. Select your instance -> Go to the **Security** tab -> Click on your **Security Group**.
3. Click **Edit inbound rules**.
4. Click **Add rule**:
   - **Type:** Custom TCP
   - **Port range:** 3000
   - **Source:** Anywhere-IPv4 (0.0.0.0/0)
5. Save the rules.

You can now visit your app at `http://<YOUR-EC2-PUBLIC-IP>:3000`

---

## 3. Viva Explanations

Here are concise answers you can provide during your Viva examination:

### Git Usage
**Why do we use Git?**
Git is a Version Control System. We used it to track changes to our project code, ensuring that we have a secure, remote backup on GitHub. It allowed us to structure our codebase logically before building pipelines.

### Jenkins Pipeline
**What is Jenkins and what does the Jenkinsfile do?**
Jenkins is a CI/CD automation server. Our `Jenkinsfile` defines a declarative pipeline with three automated stages: cloning the repository, installing the project dependencies (`npm install`), and finally running the Node.js application. This ensures that any new code pushed to the repository could be automatically deployed.

### Terraform Purpose
**What is the role of Terraform in this project?**
Terraform is an Infrastructure as Code (IaC) tool. Instead of clicking through the AWS console, we used the `main.tf` file to define exactly what cloud resources we need (an EC2 t3.micro instance and a Security Group with ports 22 and 3000 open). Running Terraform automates the consistent creation of this AWS infrastructure.

### AWS Deployment
**How is the application hosted?**
The application is hosted on an AWS EC2 instance running Amazon Linux. We installed Node.js on this instance, ran our Express backend which also serves our Frontend UI, and opened port 3000 in the AWS Security Group so users on the internet can access the website via the instance's public IP address.
