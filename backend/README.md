# EduPro Backend

A Go-based backend API for the EduPro application.

## Getting Started

### Prerequisites
- Go 1.19 or higher
- Git

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
go mod tidy
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Run the application:
```bash
go run main.go
```

The server will start on port 8080 by default.

### API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/hello` - Simple hello endpoint

### Environment Variables

- `PORT` - Server port (default: 8080)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Secret key for JWT tokens
