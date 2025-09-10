package chunker

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"

	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// Client represents the chunker client
type Client struct {
	chunkSize    int
	overlapSize  int
	minChunkSize int
}

// NewClient creates a new chunker client
func NewClient() *Client {
	return &Client{
		chunkSize:    1000, // Target chunk size in tokens (approximately)
		overlapSize:  100,  // Overlap between chunks
		minChunkSize: 100,  // Minimum chunk size
	}
}

// ChunkText splits text into overlapping chunks
func (c *Client) ChunkText(text string, metadata map[string]interface{}) ([]Chunk, error) {
	logger := utils.GetLogger()

	if text == "" {
		return nil, fmt.Errorf("text cannot be empty")
	}

	// Clean and normalize the text
	cleanedText := c.cleanText(text)
	if len(cleanedText) < c.minChunkSize {
		// If text is too small, return as single chunk
		return []Chunk{{
			Content:  cleanedText,
			Ordinal:  0,
			Metadata: metadata,
		}}, nil
	}

	// Split text into sentences first
	sentences := c.splitIntoSentences(cleanedText)
	if len(sentences) == 0 {
		return nil, fmt.Errorf("no sentences found in text")
	}

	var chunks []Chunk
	var currentChunk strings.Builder
	var currentSentences []string
	ordinal := 0

	for i, sentence := range sentences {
		// Estimate token count (rough approximation: 1 token ≈ 4 characters)
		potentialLength := currentChunk.Len() + len(sentence)
		estimatedTokens := potentialLength / 4

		// If adding this sentence would exceed chunk size, create a chunk
		if estimatedTokens > c.chunkSize && currentChunk.Len() > 0 {
			chunkContent := strings.TrimSpace(currentChunk.String())
			if len(chunkContent) >= c.minChunkSize {
				chunks = append(chunks, Chunk{
					Content: chunkContent,
					Ordinal: ordinal,
					Metadata: c.mergeMetadata(metadata, map[string]interface{}{
						"sentence_start": len(chunks) * (c.chunkSize - c.overlapSize) / 4,
						"sentence_count": len(currentSentences),
					}),
				})
				ordinal++
			}

			// Start new chunk with overlap
			currentChunk.Reset()
			currentSentences = []string{}

			// Add overlap from previous chunk
			overlapTokens := c.overlapSize / 4 // Rough token estimate
			overlapSentences := c.getLastSentences(sentences[:i], overlapTokens)
			for _, overlapSentence := range overlapSentences {
				currentChunk.WriteString(overlapSentence)
				currentChunk.WriteString(" ")
				currentSentences = append(currentSentences, overlapSentence)
			}
		}

		// Add current sentence
		if currentChunk.Len() > 0 {
			currentChunk.WriteString(" ")
		}
		currentChunk.WriteString(sentence)
		currentSentences = append(currentSentences, sentence)
	}

	// Add the last chunk if it has content
	if currentChunk.Len() > 0 {
		chunkContent := strings.TrimSpace(currentChunk.String())
		if len(chunkContent) >= c.minChunkSize {
			chunks = append(chunks, Chunk{
				Content: chunkContent,
				Ordinal: ordinal,
				Metadata: c.mergeMetadata(metadata, map[string]interface{}{
					"sentence_start": ordinal * (c.chunkSize - c.overlapSize) / 4,
					"sentence_count": len(currentSentences),
				}),
			})
		}
	}

	logger.Info("Text chunked successfully",
		zap.Int("original_length", len(text)),
		zap.Int("chunks_created", len(chunks)),
		zap.Int("chunk_size_target", c.chunkSize),
	)

	return chunks, nil
}

// cleanText normalizes and cleans the input text
func (c *Client) cleanText(text string) string {
	// Remove excessive whitespace
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")

	// Remove control characters except newlines and tabs
	text = strings.Map(func(r rune) rune {
		if unicode.IsControl(r) && r != '\n' && r != '\t' {
			return -1
		}
		return r
	}, text)

	// Normalize line breaks
	text = regexp.MustCompile(`\r\n|\r`).ReplaceAllString(text, "\n")

	// Remove excessive line breaks
	text = regexp.MustCompile(`\n{3,}`).ReplaceAllString(text, "\n\n")

	return strings.TrimSpace(text)
}

// splitIntoSentences splits text into sentences using simple heuristics
func (c *Client) splitIntoSentences(text string) []string {
	// Simple sentence splitting regex
	// This is a basic implementation - for production, consider using a proper NLP library
	sentenceRegex := regexp.MustCompile(`[.!?]+\s+`)

	sentences := sentenceRegex.Split(text, -1)

	var result []string
	for _, sentence := range sentences {
		sentence = strings.TrimSpace(sentence)
		if len(sentence) > 10 { // Minimum sentence length
			result = append(result, sentence)
		}
	}

	return result
}

// getLastSentences returns the last N sentences that fit within the token limit
func (c *Client) getLastSentences(sentences []string, maxTokens int) []string {
	if len(sentences) == 0 {
		return []string{}
	}

	var result []string
	currentTokens := 0

	// Start from the end and work backwards
	for i := len(sentences) - 1; i >= 0; i-- {
		sentenceTokens := len(sentences[i]) / 4 // Rough token estimate
		if currentTokens+sentenceTokens > maxTokens {
			break
		}

		result = append([]string{sentences[i]}, result...)
		currentTokens += sentenceTokens
	}

	return result
}

// mergeMetadata merges base metadata with additional metadata
func (c *Client) mergeMetadata(base map[string]interface{}, additional map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	// Copy base metadata
	for k, v := range base {
		result[k] = v
	}

	// Add additional metadata
	for k, v := range additional {
		result[k] = v
	}

	return result
}

// SetChunkSize sets the target chunk size
func (c *Client) SetChunkSize(size int) {
	if size > 0 {
		c.chunkSize = size
	}
}

// SetOverlapSize sets the overlap size between chunks
func (c *Client) SetOverlapSize(size int) {
	if size >= 0 && size < c.chunkSize {
		c.overlapSize = size
	}
}

// Chunk represents a text chunk
type Chunk struct {
	Content  string                 `json:"content"`
	Ordinal  int                    `json:"ordinal"`
	Metadata map[string]interface{} `json:"metadata"`
}
