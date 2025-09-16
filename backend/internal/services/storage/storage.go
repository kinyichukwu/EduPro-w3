package storage

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	storage_go "github.com/supabase-community/storage-go"
	"go.uber.org/zap"
)

// StorageService defines the interface for storage operations
type StorageService interface {
	UploadFile(file *multipart.FileHeader, userID string) (*UploadResult, error)
	GetSignedURL(path string, expiresIn int) (string, error)
	DeleteFile(path string) error
	ListBuckets() ([]storage_go.Bucket, error)
	ListFiles(bucketName string, path string, limit int, offset int) ([]storage_go.FileObject, error)
}

// HTTPStorageClient implements StorageService using direct HTTP calls to Supabase
type HTTPStorageClient struct {
	supabaseURL   string
	supabaseKey   string
	defaultBucket string
}

// NewStorageService creates a new storage service implementation
func NewStorageService(cfg *config.Config) StorageService {
	logger := utils.GetLogger()

	logger.Info("Creating HTTP storage service",
		zap.String("supabase_url", cfg.SupabaseURL),
		zap.String("default_bucket", cfg.BucketName),
	)

	return &HTTPStorageClient{
		supabaseURL:   cfg.SupabaseURL,
		supabaseKey:   cfg.SupabaseKey,
		defaultBucket: cfg.BucketName,
	}
}

// Legacy Client for backward compatibility - will be removed
type Client struct {
	StorageService
}

// NewClient creates a legacy client - use NewStorageService instead
func NewClient(cfg *config.Config) (*Client, error) {
	service := NewStorageService(cfg)
	return &Client{StorageService: service}, nil
}

// makeHTTPRequest is a common method for making HTTP requests to Supabase
func (h *HTTPStorageClient) makeHTTPRequest(method, endpoint string, body io.Reader, contentType string) (*http.Response, error) {
	url := fmt.Sprintf("%s/storage/v1%s", h.supabaseURL, endpoint)

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+h.supabaseKey)
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	return client.Do(req)
}

// UploadFile implements StorageService.UploadFile
func (h *HTTPStorageClient) UploadFile(file *multipart.FileHeader, userID string) (*UploadResult, error) {
	logger := utils.GetLogger()

	logger.Info("Starting file upload",
		zap.String("filename", file.Filename),
		zap.String("user_id", userID),
		zap.Int64("file_size", file.Size),
		zap.String("bucket", h.defaultBucket),
	)

	// Validate file size (10MB limit)
	if file.Size > 10*1024*1024 {
		return nil, fmt.Errorf("file size exceeds 10MB limit")
	}

	// Validate file type
	if !h.isValidFileType(file.Filename) {
		ext := filepath.Ext(file.Filename)
		return nil, fmt.Errorf("unsupported file type: %s", ext)
	}

	// Open and read file
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	fileContent, err := io.ReadAll(src)
	if err != nil {
		return nil, fmt.Errorf("failed to read file content: %w", err)
	}

	// Detect MIME type
	detectedMimeType := http.DetectContentType(fileContent)

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	baseFilename := strings.TrimSuffix(file.Filename, ext)
	uniqueFilename := fmt.Sprintf("%s/%s_%s%s", userID, baseFilename, uuid.New().String()[:8], ext)

	// Upload using common HTTP method
	endpoint := fmt.Sprintf("/object/%s/%s", h.defaultBucket, uniqueFilename)
	resp, err := h.makeHTTPRequest("POST", endpoint, bytes.NewReader(fileContent), detectedMimeType)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	logger.Info("Upload response received",
		zap.Int("status_code", resp.StatusCode),
		zap.String("response_body", string(responseBody)),
	)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("upload failed with status %d: %s", resp.StatusCode, string(responseBody))
	}

	// Generate public URL
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", h.supabaseURL, h.defaultBucket, uniqueFilename)

	uploadResult := &UploadResult{
		Filename:    file.Filename,
		StoragePath: uniqueFilename,
		PublicURL:   publicURL,
		MimeType:    detectedMimeType,
		Size:        file.Size,
		UploadedAt:  time.Now(),
		Key:         uniqueFilename,
	}

	logger.Info("File uploaded successfully",
		zap.String("filename", file.Filename),
		zap.String("storage_path", uniqueFilename),
		zap.String("public_url", publicURL),
	)

	return uploadResult, nil
}

// GetSignedURL implements StorageService.GetSignedURL
func (h *HTTPStorageClient) GetSignedURL(path string, expiresIn int) (string, error) {
	// Implementation using direct HTTP call
	endpoint := fmt.Sprintf("/object/sign/%s/%s", h.defaultBucket, path)
	body := fmt.Sprintf(`{"expiresIn": %d}`, expiresIn)

	resp, err := h.makeHTTPRequest("POST", endpoint, strings.NewReader(body), "application/json")
	if err != nil {
		return "", fmt.Errorf("failed to create signed URL: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("signed URL creation failed with status %d: %s", resp.StatusCode, string(responseBody))
	}

	var result struct {
		SignedURL string `json:"signedURL"`
	}
	if err := json.Unmarshal(responseBody, &result); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	// Ensure absolute URL (Supabase may return a relative path)
	signedURL := result.SignedURL
	if !strings.HasPrefix(signedURL, "http://") && !strings.HasPrefix(signedURL, "https://") {
		signedURL = fmt.Sprintf("%s/storage/v1%s", h.supabaseURL, signedURL)
	}

	return signedURL, nil
}

// DeleteFile implements StorageService.DeleteFile
func (h *HTTPStorageClient) DeleteFile(path string) error {
	endpoint := fmt.Sprintf("/object/%s/%s", h.defaultBucket, path)

	resp, err := h.makeHTTPRequest("DELETE", endpoint, nil, "")
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		responseBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("delete failed with status %d: %s", resp.StatusCode, string(responseBody))
	}

	return nil
}

// ListBuckets implements StorageService.ListBuckets
func (h *HTTPStorageClient) ListBuckets() ([]storage_go.Bucket, error) {
	resp, err := h.makeHTTPRequest("GET", "/bucket", nil, "application/json")
	if err != nil {
		return nil, fmt.Errorf("failed to list buckets: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("list buckets failed with status %d: %s", resp.StatusCode, string(responseBody))
	}

	var buckets []storage_go.Bucket
	if err := json.Unmarshal(responseBody, &buckets); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return buckets, nil
}

// ListFiles implements StorageService.ListFiles
func (h *HTTPStorageClient) ListFiles(bucketName string, path string, limit int, offset int) ([]storage_go.FileObject, error) {
	endpoint := fmt.Sprintf("/object/list/%s", bucketName)

	requestBody := map[string]interface{}{
		"limit":  limit,
		"offset": offset,
		"prefix": path,
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := h.makeHTTPRequest("POST", endpoint, bytes.NewReader(bodyBytes), "application/json")
	if err != nil {
		return nil, fmt.Errorf("failed to list files: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("list files failed with status %d: %s", resp.StatusCode, string(responseBody))
	}

	var files []storage_go.FileObject
	if err := json.Unmarshal(responseBody, &files); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return files, nil
}

// isValidFileType checks if the file type is supported
func (h *HTTPStorageClient) isValidFileType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validTypes := map[string]bool{
		".pdf": true,
		".txt": true,
	}
	return validTypes[ext]
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
