.PHONY: build run test clean docker-build docker-run dev

# Variables
APP_NAME=edupro-api
BUILD_DIR=bin
DOCKER_IMAGE=edupro-backend

# Default target
all: build

# Build the application
build:
	@echo "Building $(APP_NAME)..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(APP_NAME) cmd/api/main.go

# Run the application locally
run:
	@echo "Running $(APP_NAME)..."
	@go run cmd/api/main.go

# Run in development mode with hot reload (requires air)
dev:
	@echo "Starting development server..."
	@$(shell go env GOPATH)/bin/air -c air.toml

# Run tests
test:
	@echo "Running tests..."
	@go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out

# Install dependencies
deps:
	@echo "Installing dependencies..."
	@go mod download
	@go mod tidy

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...

# Lint code (requires golangci-lint)
lint:
	@echo "Linting code..."
	@golangci-lint run

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	@docker build -t $(DOCKER_IMAGE) .

# Run Docker container
docker-run:
	@echo "Running Docker container..."
	@docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE)

# Deploy to Render (requires render CLI)
deploy:
	@echo "Deploying to Render..."
	@render deploy

# Initialize project (setup git hooks, install tools)
init:
	@echo "Initializing project..."
	@go mod download
	@go install github.com/air-verse/air@latest
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Generate API documentation (requires swag)
docs:
	@echo "Generating API documentation..."
	@swag init -g cmd/api/main.go

# Check for security vulnerabilities
security:
	@echo "Checking for security vulnerabilities..."
	@govulncheck ./...