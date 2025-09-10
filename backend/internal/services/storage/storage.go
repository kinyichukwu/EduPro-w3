package storage

import (
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/supabase-community/supabase-go"
	"go.uber.org/zap"
)

// Client represents the storage client
type Client struct {
	supabase   *supabase.Client
	bucketName string
}

// NewClient creates a new storage client
func NewClient(cfg *config.Config) (*Client, error) {
	logger := utils.GetLogger()

	supabaseClient, err := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseKey, &supabase.ClientOptions{})
	if err != nil {
		logger.Error("Failed to create Supabase client", zap.Error(err))
		return nil, fmt.Errorf("failed to create Supabase client: %w", err)
	}

	return &Client{
		supabase:   supabaseClient,
		bucketName: cfg.BucketName,
	}, nil
}

// UploadFile uploads a file to Supabase storage
func (c *Client) UploadFile(file *multipart.FileHeader, userID string) (*UploadResult, error) {
	logger := utils.GetLogger()

	// Validate file type
	if !c.isValidFileType(file.Filename) {
		return nil, fmt.Errorf("unsupported file type: %s", filepath.Ext(file.Filename))
	}

	// Validate file size (10MB limit)
	if file.Size > 10*1024*1024 {
		return nil, fmt.Errorf("file size exceeds 10MB limit")
	}

	// Open the file
	src, err := file.Open()
	if err != nil {
		logger.Error("Failed to open uploaded file", zap.Error(err))
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Read file content
	fileContent, err := io.ReadAll(src)
	if err != nil {
		logger.Error("Failed to read file content", zap.Error(err))
		return nil, fmt.Errorf("failed to read file content: %w", err)
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	baseFilename := strings.TrimSuffix(file.Filename, ext)
	uniqueFilename := fmt.Sprintf("%s/%s_%s%s",
		userID,
		baseFilename,
		uuid.New().String()[:8],
		ext,
	)

	// Upload to Supabase storage
	uploadResp, err := c.supabase.Storage.UploadFile(c.bucketName, uniqueFilename, strings.NewReader(string(fileContent)))
	if err != nil {
		logger.Error("Failed to upload file to Supabase",
			zap.Error(err),
			zap.String("filename", uniqueFilename),
		)
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Get public URL
	publicURLResp := c.supabase.Storage.GetPublicUrl(c.bucketName, uniqueFilename)
	publicURL := publicURLResp.SignedURL

	result := &UploadResult{
		Filename:    file.Filename,
		StoragePath: uniqueFilename,
		PublicURL:   publicURL,
		MimeType:    c.getMimeType(file.Filename),
		Size:        file.Size,
		UploadedAt:  time.Now(),
		Key:         uploadResp.Key,
	}

	logger.Info("File uploaded successfully",
		zap.String("filename", file.Filename),
		zap.String("storage_path", uniqueFilename),
		zap.Int64("size", file.Size),
	)

	return result, nil
}

// GetSignedURL generates a signed URL for private file access
func (c *Client) GetSignedURL(path string, expiresIn int) (string, error) {
	logger := utils.GetLogger()

	signedURLResp, err := c.supabase.Storage.CreateSignedUrl(c.bucketName, path, expiresIn)
	if err != nil {
		logger.Error("Failed to create signed URL",
			zap.Error(err),
			zap.String("path", path),
		)
		return "", fmt.Errorf("failed to create signed URL: %w", err)
	}

	return signedURLResp.SignedURL, nil
}

// DeleteFile deletes a file from storage
func (c *Client) DeleteFile(path string) error {
	logger := utils.GetLogger()

	_, err := c.supabase.Storage.RemoveFile(c.bucketName, []string{path})
	if err != nil {
		logger.Error("Failed to delete file",
			zap.Error(err),
			zap.String("path", path),
		)
		return fmt.Errorf("failed to delete file: %w", err)
	}

	logger.Info("File deleted successfully", zap.String("path", path))
	return nil
}

// isValidFileType checks if the file type is supported
func (c *Client) isValidFileType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validTypes := map[string]bool{
		".pdf": true,
		".txt": true,
		// ".docx": true, // Disabled for now
	}
	return validTypes[ext]
}

// getMimeType returns the MIME type based on file extension
func (c *Client) getMimeType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	mimeTypes := map[string]string{
		".pdf": "application/pdf",
		".txt": "text/plain",
		// ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Disabled
	}

	if mimeType, exists := mimeTypes[ext]; exists {
		return mimeType
	}
	return "application/octet-stream"
}

// UploadResult represents the result of a file upload
type UploadResult struct {
	Filename    string    `json:"filename"`
	StoragePath string    `json:"storage_path"`
	PublicURL   string    `json:"public_url"`
	MimeType    string    `json:"mime_type"`
	Size        int64     `json:"size"`
	UploadedAt  time.Time `json:"uploaded_at"`
	Key         string    `json:"key"`
}
