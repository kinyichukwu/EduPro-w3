package ai

import "github.com/kinyichukwu/edu-pro-backend/internal/models"

// GeminiRequest represents a request to the Gemini API
type GeminiRequest struct {
	Task    string
	Query   string
	Subject string
	Level   string
}

// GeminiResponse represents a response from the Gemini API
type GeminiResponse struct {
	Content string
	Usage   *Usage
}

// Usage represents API usage statistics
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// Service defines the AI service interface
type Service interface {
	GenerateQuiz(req *GeminiRequest) (*models.QuizResponse, error)
	GenerateExplanation(req *GeminiRequest) (*models.ExplanationResponse, error)
	IsHealthy() bool
}

// Client wraps the Gemini API client
type Client struct {
	apiKey string
	model  string
}

// NewClient creates a new AI service client
func NewClient(apiKey string) Service {
	return &Client{
		apiKey: apiKey,
		model:  "gemini-2.5-flash-lite-preview-06-17",
	}
}