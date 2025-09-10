package extract

import (
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/ledongthuc/pdf"
	"go.uber.org/zap"
)

// Client represents the text extraction client
type Client struct{}

// NewClient creates a new extraction client
func NewClient() *Client {
	return &Client{}
}

// ExtractText extracts text from various file formats
func (c *Client) ExtractText(reader io.Reader, filename string) (*ExtractionResult, error) {
	logger := utils.GetLogger()

	ext := strings.ToLower(filepath.Ext(filename))

	var text string
	var metadata map[string]interface{}
	var err error

	switch ext {
	case ".pdf":
		text, metadata, err = c.extractFromPDF(reader)
	case ".docx":
		text, metadata, err = c.extractFromDOCX(reader)
	case ".txt":
		text, metadata, err = c.extractFromTXT(reader)
	default:
		return nil, fmt.Errorf("unsupported file type: %s", ext)
	}

	if err != nil {
		logger.Error("Failed to extract text",
			zap.Error(err),
			zap.String("filename", filename),
			zap.String("file_type", ext),
		)
		return nil, fmt.Errorf("failed to extract text from %s: %w", ext, err)
	}

	// Clean and validate extracted text
	text = c.cleanExtractedText(text)
	if len(text) == 0 {
		return nil, fmt.Errorf("no text content found in file")
	}

	// Add basic metadata
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	metadata["filename"] = filename
	metadata["file_type"] = ext
	metadata["text_length"] = len(text)
	metadata["word_count"] = len(strings.Fields(text))

	result := &ExtractionResult{
		Text:     text,
		Metadata: metadata,
	}

	logger.Info("Text extracted successfully",
		zap.String("filename", filename),
		zap.String("file_type", ext),
		zap.Int("text_length", len(text)),
		zap.Int("word_count", len(strings.Fields(text))),
	)

	return result, nil
}

// extractFromPDF extracts text from PDF files
func (c *Client) extractFromPDF(reader io.Reader) (string, map[string]interface{}, error) {
	// Read all content into memory (required by pdf library)
	content, err := io.ReadAll(reader)
	if err != nil {
		return "", nil, fmt.Errorf("failed to read PDF content: %w", err)
	}

	// Open PDF from bytes
	pdfReader, err := pdf.NewReader(strings.NewReader(string(content)), int64(len(content)))
	if err != nil {
		return "", nil, fmt.Errorf("failed to open PDF: %w", err)
	}

	var textBuilder strings.Builder
	pageCount := pdfReader.NumPage()

	// Extract text from each page
	for i := 1; i <= pageCount; i++ {
		page := pdfReader.Page(i)
		if page.V.IsNull() {
			continue
		}

		pageText, err := page.GetPlainText(nil)
		if err != nil {
			// Log error but continue with other pages
			utils.GetLogger().Warn("Failed to extract text from PDF page",
				zap.Int("page", i),
				zap.Error(err),
			)
			continue
		}

		textBuilder.WriteString(pageText)
		textBuilder.WriteString("\n")
	}

	metadata := map[string]interface{}{
		"page_count": pageCount,
		"format":     "PDF",
	}

	return textBuilder.String(), metadata, nil
}

// extractFromDOCX extracts text from DOCX files
func (c *Client) extractFromDOCX(reader io.Reader) (string, map[string]interface{}, error) {
	// For now, return an error as DOCX extraction is complex
	// In production, you would use a proper DOCX library or external service
	return "", nil, fmt.Errorf("DOCX extraction not implemented - please convert to PDF or TXT")
}

// extractFromTXT extracts text from plain text files
func (c *Client) extractFromTXT(reader io.Reader) (string, map[string]interface{}, error) {
	content, err := io.ReadAll(reader)
	if err != nil {
		return "", nil, fmt.Errorf("failed to read TXT content: %w", err)
	}

	text := string(content)
	lineCount := len(strings.Split(text, "\n"))

	metadata := map[string]interface{}{
		"line_count": lineCount,
		"format":     "TXT",
		"encoding":   "UTF-8", // Assuming UTF-8
	}

	return text, metadata, nil
}

// cleanExtractedText cleans and normalizes extracted text
func (c *Client) cleanExtractedText(text string) string {
	// Remove excessive whitespace
	text = strings.TrimSpace(text)

	// Normalize line breaks
	text = strings.ReplaceAll(text, "\r\n", "\n")
	text = strings.ReplaceAll(text, "\r", "\n")

	// Remove excessive blank lines (more than 2 consecutive)
	lines := strings.Split(text, "\n")
	var cleanedLines []string
	consecutiveEmpty := 0

	for _, line := range lines {
		line = strings.TrimSpace(line)

		if line == "" {
			consecutiveEmpty++
			if consecutiveEmpty <= 2 {
				cleanedLines = append(cleanedLines, line)
			}
		} else {
			consecutiveEmpty = 0
			cleanedLines = append(cleanedLines, line)
		}
	}

	return strings.Join(cleanedLines, "\n")
}

// IsSupported checks if a file type is supported for extraction
func (c *Client) IsSupported(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	supportedTypes := map[string]bool{
		".pdf": true,
		".txt": true,
		// ".docx": true, // Disabled for now - complex extraction
	}
	return supportedTypes[ext]
}

// ExtractionResult represents the result of text extraction
type ExtractionResult struct {
	Text     string                 `json:"text"`
	Metadata map[string]interface{} `json:"metadata"`
}
