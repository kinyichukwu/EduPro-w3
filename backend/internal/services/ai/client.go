package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/kinyichukwu/edu-pro-backend/pkg/constants"

	"github.com/google/generative-ai-go/genai"
	"go.uber.org/zap"
	"google.golang.org/api/option"
)

// GenerateQuiz creates quiz questions using Gemini API
func (c *Client) GenerateQuiz(req *GeminiRequest) (*models.QuizResponse, error) {
	logger := utils.GetLogger()
	
	// Sanitize inputs
	topic := SanitizeInput(req.Query)
	subject := SanitizeInput(req.Subject)
	level := SanitizeInput(req.Level)
	
	// Generate prompt
	prompt := QuizPrompt(topic, subject, level, constants.DefaultQuizQuestions)
	
	logger.Info("Generating quiz",
		zap.String("topic", topic),
		zap.String("subject", subject),
		zap.String("level", level),
	)
	
	// Call Gemini API
	content, err := c.callGeminiAPI(prompt)
	if err != nil {
		logger.Error("Failed to call Gemini API for quiz", zap.Error(err))
		return nil, fmt.Errorf("failed to generate quiz: %w", err)
	}
	
	// Clean and parse response
	cleanedContent := cleanJSONResponse(content)
	
	var quizData struct {
		Questions []models.Question `json:"questions"`
	}
	
	if err := json.Unmarshal([]byte(cleanedContent), &quizData); err != nil {
		logger.Error("Failed to parse quiz response", zap.Error(err), zap.String("content", content))
		return nil, fmt.Errorf("failed to parse quiz response: %w", err)
	}
	
	// Validate response
	if len(quizData.Questions) == 0 {
		return nil, fmt.Errorf("no questions generated")
	}
	
	// Build response
	response := &models.QuizResponse{
		Questions: quizData.Questions,
		Topic:     topic,
		Subject:   subject,
		Level:     level,
	}
	
	logger.Info("Quiz generated successfully", 
		zap.Int("questions_count", len(quizData.Questions)),
		zap.String("topic", topic),
	)
	
	return response, nil
}

// GenerateExplanation creates explanations using Gemini API
func (c *Client) GenerateExplanation(req *GeminiRequest) (*models.ExplanationResponse, error) {
	logger := utils.GetLogger()
	
	// Sanitize inputs
	topic := SanitizeInput(req.Query)
	subject := SanitizeInput(req.Subject)
	level := SanitizeInput(req.Level)
	
	// Generate prompt
	prompt := ExplanationPrompt(topic, subject, level)
	
	logger.Info("Generating explanation",
		zap.String("topic", topic),
		zap.String("subject", subject),
		zap.String("level", level),
	)
	
	// Call Gemini API
	content, err := c.callGeminiAPI(prompt)
	if err != nil {
		logger.Error("Failed to call Gemini API for explanation", zap.Error(err))
		return nil, fmt.Errorf("failed to generate explanation: %w", err)
	}

	cleanedContent := cleanJSONResponse(content)
	
	// Parse response
	var explanationData struct {
		Explanation string   `json:"explanation"`
		KeyPoints   []string `json:"key_points"`
		Summary     string   `json:"summary"`
		Examples    []string `json:"examples"`
	}
	
	if err := json.Unmarshal([]byte(cleanedContent), &explanationData); err != nil {
		logger.Error("Failed to parse explanation response", zap.Error(err), zap.String("content", cleanedContent))
		return nil, fmt.Errorf("failed to parse explanation response: %w", err)
	}
	
	// Validate response
	if explanationData.Explanation == "" {
		return nil, fmt.Errorf("no explanation generated")
	}
	
	// Build response
	response := &models.ExplanationResponse{
		Explanation: explanationData.Explanation,
		KeyPoints:   explanationData.KeyPoints,
		Summary:     explanationData.Summary,
		Examples:    explanationData.Examples,
		Topic:       topic,
		Subject:     subject,
		Level:       level,
	}
	
	logger.Info("Explanation generated successfully", 
		zap.String("topic", topic),
		zap.Int("key_points_count", len(explanationData.KeyPoints)),
	)
	
	return response, nil
}

// IsHealthy checks if the AI service is available
func (c *Client) IsHealthy() bool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	client, err := genai.NewClient(ctx, option.WithAPIKey(c.apiKey))
	if err != nil {
		return false
	}
	defer client.Close()
	
	// Try a simple test request
	model := client.GenerativeModel(c.model)
	_, err = model.GenerateContent(ctx, genai.Text("Test"))
	
	return err == nil
}

// callGeminiAPI makes a request to the Gemini API
func (c *Client) callGeminiAPI(prompt string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	client, err := genai.NewClient(ctx, option.WithAPIKey(c.apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()
	
	// Configure the model
	model := client.GenerativeModel(c.model)
	model.SetTemperature(0.7)
	model.SetMaxOutputTokens(2048)
	model.SetTopP(0.8)
	model.SetTopK(40)
	
	// Generate content
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
	}
	
	// Extract text from response
	if len(resp.Candidates) == 0 {
		return "", fmt.Errorf("no response candidates")
	}
	
	candidate := resp.Candidates[0]
	if candidate.Content == nil || len(candidate.Content.Parts) == 0 {
		return "", fmt.Errorf("empty response content")
	}
	
	// Get the text content
	var content strings.Builder
	for _, part := range candidate.Content.Parts {
		if textPart, ok := part.(genai.Text); ok {
			content.WriteString(string(textPart))
		}
	}
	
	result := strings.TrimSpace(content.String())
	if result == "" {
		return "", fmt.Errorf("empty response text")
	}
	
	return result, nil
}

// cleanJSONResponse removes markdown code blocks and cleans JSON response
func cleanJSONResponse(content string) string {
	// Remove markdown code blocks
	content = strings.TrimSpace(content)
	
	// Remove ```json at the beginning
	if strings.HasPrefix(content, "```json") {
		content = strings.TrimPrefix(content, "```json")
	}
	
	// Remove ``` at the beginning (in case it's just ```)
	if strings.HasPrefix(content, "```") {
		content = strings.TrimPrefix(content, "```")
	}
	
	// Remove ``` at the end
	if strings.HasSuffix(content, "```") {
		content = strings.TrimSuffix(content, "```")
	}
	
	// Trim whitespace
	content = strings.TrimSpace(content)
	
	return content
}