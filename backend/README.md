# EDUPRO Backend API

A powerful AI-driven educational API for Nigerian students, designed to generate quizzes and explanations for WAEC and JAMB preparation.

## Features

- **Quiz Generation**: Create multiple-choice questions on any topic
- **Explanations**: Get detailed explanations of complex concepts
- **WAEC/JAMB Aligned**: Content specifically tailored for Nigerian curriculum
- **Fast & Scalable**: Built with Go for high performance
- **RESTful API**: Clean, predictable API design

## Quick Start

### Prerequisites

- Go 1.22 or higher
- Gemini API key from Google

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/edupro-backend.git
cd edupro-backend
```

2. Install dependencies:
```bash
go mod download
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
make run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Health Check
```
GET /health
```

### Generate Quiz
```
POST /api/query
Content-Type: application/json

{
  "task": "quiz",
  "query": "photosynthesis in plants",
  "subject": "Biology",
  "level": "SS2"
}
```

### Generate Explanation
```
POST /api/query
Content-Type: application/json

{
  "task": "explain",
  "query": "how does photosynthesis work",
  "subject": "Biology",
  "level": "SS2"
}
```

### Get Available Tasks
```
GET /api/tasks
```

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `ENVIRONMENT` | Environment (development/production) | `development` |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `RATE_LIMIT` | Requests per minute | `100` |

## Development

### Running in Development Mode

```bash
# Install air for hot reload
go install github.com/cosmtrek/air@latest

# Run with hot reload
make dev
```

### Testing

```bash
# Run tests
make test

# Run tests with coverage
make test-coverage
```

### Code Quality

```bash
# Format code
make fmt

# Lint code (requires golangci-lint)
make lint

# Security check
make security
```

## Deployment

### Deploy to Render

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

### Docker Deployment

```bash
# Build Docker image
make docker-build

# Run Docker container
make docker-run
```

## Project Structure

```
edupro-backend/
├── cmd/api/                 # Application entry point
├── internal/
│   ├── config/             # Configuration management
│   ├── handlers/           # HTTP handlers
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── pkg/                    # Public packages
├── deployments/            # Deployment configs
└── docs/                   # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@edupro.ng or join our Slack channel.

## Roadmap

- [ ] User authentication
- [ ] File upload support
- [ ] RAG implementation
- [ ] Flashcard generation
- [ ] Teacher dashboard
- [ ] Mobile app support

---

Built with ❤️ for Nigerian students