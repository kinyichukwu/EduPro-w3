package embeddings

import (
	"context"
	"fmt"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
	"google.golang.org/api/option"
)

// Client represents the embeddings client
type Client struct {
	apiKey string
	model  string
}

// NewClient creates a new embeddings client
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		model:  "models/embedding-001",
	}
}

// GenerateEmbedding generates an embedding for the given text
func (c *Client) GenerateEmbedding(text string) ([]float32, error) {
	logger := utils.GetLogger()

	if text == "" {
		return nil, fmt.Errorf("text cannot be empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(c.apiKey))
	if err != nil {
		logger.Error("Failed to create Gemini client", zap.Error(err))
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	// Get the embedding model
	model := client.EmbeddingModel(c.model)

	// Generate embedding
	resp, err := model.EmbedContent(ctx, genai.Text(text))
	if err != nil {
		logger.Error("Failed to generate embedding",
			zap.Error(err),
			zap.String("text_preview", truncateText(text, 100)),
		)
		return nil, fmt.Errorf("failed to generate embedding: %w", err)
	}

	// Extract embedding values
	if resp.Embedding == nil || len(resp.Embedding.Values) == 0 {
		logger.Error("Empty embedding response")
		return nil, fmt.Errorf("empty embedding response")
	}

	logger.Debug("Embedding generated successfully",
		zap.Int("dimension", len(resp.Embedding.Values)),
		zap.String("text_preview", truncateText(text, 100)),
	)

	return resp.Embedding.Values, nil
}

// GenerateEmbeddings generates embeddings for multiple texts in batch
func (c *Client) GenerateEmbeddings(texts []string) ([][]float32, error) {
	logger := utils.GetLogger()

	if len(texts) == 0 {
		return nil, fmt.Errorf("texts cannot be empty")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(c.apiKey))
	if err != nil {
		logger.Error("Failed to create Gemini client", zap.Error(err))
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	// Get the embedding model
	model := client.EmbeddingModel(c.model)

	var embeddings [][]float32

	// Process texts in batches to avoid rate limits
	batchSize := 10
	for i := 0; i < len(texts); i += batchSize {
		end := i + batchSize
		if end > len(texts) {
			end = len(texts)
		}

		batch := texts[i:end]
		logger.Debug("Processing embedding batch",
			zap.Int("batch_start", i),
			zap.Int("batch_size", len(batch)),
		)

		for _, text := range batch {
			if text == "" {
				logger.Warn("Skipping empty text in batch")
				embeddings = append(embeddings, nil)
				continue
			}

			resp, err := model.EmbedContent(ctx, genai.Text(text))
			if err != nil {
				logger.Error("Failed to generate embedding in batch",
					zap.Error(err),
					zap.String("text_preview", truncateText(text, 100)),
				)
				return nil, fmt.Errorf("failed to generate embedding for text: %w", err)
			}

			if resp.Embedding == nil || len(resp.Embedding.Values) == 0 {
				logger.Error("Empty embedding response in batch")
				return nil, fmt.Errorf("empty embedding response for text")
			}

			embeddings = append(embeddings, resp.Embedding.Values)
		}

		// Add a small delay between batches to respect rate limits
		if end < len(texts) {
			time.Sleep(100 * time.Millisecond)
		}
	}

	logger.Info("Batch embeddings generated successfully",
		zap.Int("total_texts", len(texts)),
		zap.Int("total_embeddings", len(embeddings)),
	)

	return embeddings, nil
}

// IsHealthy checks if the embeddings service is available
func (c *Client) IsHealthy() bool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(c.apiKey))
	if err != nil {
		return false
	}
	defer client.Close()

	// Try a simple embedding request
	model := client.EmbeddingModel(c.model)
	_, err = model.EmbedContent(ctx, genai.Text("test"))

	return err == nil
}

// truncateText truncates text to a specified length for logging
func truncateText(text string, maxLen int) string {
	if len(text) <= maxLen {
		return text
	}
	return text[:maxLen] + "..."
}

// EmbeddingResult represents the result of an embedding operation
type EmbeddingResult struct {
	Text      string    `json:"text"`
	Embedding []float32 `json:"embedding"`
	Dimension int       `json:"dimension"`
}
