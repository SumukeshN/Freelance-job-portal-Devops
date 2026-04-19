provider "aws" {
  region = "us-east-1"
}

resource "aws_security_group" "job_portal_sg" {
  name        = "job-portal-sg"
  description = "Security group for Job Portal EC2"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-0ebfd941bbafe70c6" # Amazon Linux 2023 AMI in us-east-1
  instance_type = "t3.micro"
  vpc_security_group_ids = [aws_security_group.job_portal_sg.id]

  tags = {
    Name = "FreelanceJobPortal"
  }
}
