variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment label (dev/stage/prod)"
  type        = string
  default     = "dev"
}

variable "name_prefix" {
  description = "Prefix for AWS resource names"
  type        = string
  default     = "draftly-tf"
}

variable "app_instance_type" {
  description = "EC2 instance type for the app server"
  type        = string
  default     = "t3.micro"
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for the Jenkins server"
  type        = string
  default     = "t3.small"
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH to instances (recommended: your public IP/32)"
  type        = string
}

variable "allowed_jenkins_cidr" {
  description = "CIDR allowed to access Jenkins UI (recommended: your public IP/32)"
  type        = string
}

variable "backend_port" {
  description = "Port exposed publicly for backend API (from docker-compose.prod.yml)"
  type        = number
  default     = 5000
}

variable "jenkins_port" {
  description = "Jenkins UI port"
  type        = number
  default     = 8080
}

variable "create_key_pair" {
  description = "Whether Terraform should create an AWS key pair from ssh_public_key_path"
  type        = bool
  default     = false
}

variable "ssh_key_name" {
  description = "Existing AWS EC2 key pair name to attach to instances (used when create_key_pair=false)"
  type        = string
  default     = null
}

variable "ssh_public_key_path" {
  description = "Path to public key (used when create_key_pair=true)"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

