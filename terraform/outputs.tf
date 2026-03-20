output "app_server_public_ip" {
  value       = aws_instance.app_server.public_ip
  description = "Public IP of the app server EC2 instance"
}

output "jenkins_server_public_ip" {
  value       = aws_instance.jenkins_server.public_ip
  description = "Public IP of the Jenkins EC2 instance"
}

output "jenkins_url" {
  value       = "http://${aws_instance.jenkins_server.public_ip}:${var.jenkins_port}"
  description = "Jenkins UI URL (if allowed by allowed_jenkins_cidr)"
}

