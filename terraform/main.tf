/*
  Starter Terraform scaffold.

  This repo ships with Docker Compose for local dev. For cloud deployment,
  wire up:
  - VPC + subnets
  - ECS/Fargate (or EKS) services for frontend/backend
  - RDS Postgres
  - ALB + ACM cert + Route53
  - Secrets Manager for JWT_SECRET and DB creds
*/

locals {
  name = var.project_name
}

output "project_name" {
  value = local.name
}

