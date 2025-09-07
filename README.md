# EduPro

A full-stack educational platform built with React + TypeScript frontend and Go backend.

## Project Structure

```
EduPro-w3/
├── frontend/          # React + TypeScript + Vite application
├── backend/           # Go REST API server
└── README.md         # This file
```

## Prerequisites

- **Node.js** (v18 or higher)
- **Yarn** package manager
- **Go** (v1.24 or higher)

## Getting Started

### Frontend Development

The frontend is a React application built with Vite and TypeScript.

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Start development server (runs on http://localhost:5173)
yarn dev

# Build for production
yarn build

# Type checking
yarn type-check

# Lint code
yarn lint
```

### Backend Development

The backend is a Go REST API server using Gorilla Mux for routing.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
go mod tidy

# Run the server (runs on http://localhost:8080)
go run main.go

# Build binary
go build -o edupro-backend main.go
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/hello` - Simple hello world endpoint

## Development Workflow

1. Start the backend server:
   ```bash
   cd backend && go run main.go
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend && yarn dev
   ```

3. Open your browser to `http://localhost:5173` to see the frontend
4. The frontend can make API calls to `http://localhost:8080/api/*`

## Features

- ✅ React 19 with TypeScript
- ✅ Vite for fast development and building
- ✅ Go backend with CORS enabled
- ✅ ESLint for code linting
- ✅ Hot module replacement (HMR)
- ✅ Production-ready build process

## Next Steps

- Add database integration to the backend
- Implement authentication and authorization
- Add more React components and pages
- Set up testing frameworks
- Add Docker configuration for deployment