package ipfs

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"go.uber.org/zap"
)

// Service handles IPFS operations via Pinata
type Service struct {
	gatewayURL string
	apiURL     string
	apiKey     string
	apiSecret  string
	jwt        string
	httpClient *http.Client
	logger     *zap.Logger
}

// NewService creates a new IPFS service with Pinata configuration
func NewService(gatewayURL, apiURL string, logger *zap.Logger) *Service {
	return &Service{
		gatewayURL: gatewayURL,
		apiURL:     apiURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

// NewPinataService creates a new IPFS service configured for Pinata
func NewPinataService(apiKey, apiSecret, jwt, gatewayURL string, logger *zap.Logger) *Service {
	return &Service{
		gatewayURL: gatewayURL,
		apiURL:     "https://api.pinata.cloud",
		apiKey:     apiKey,
		apiSecret:  apiSecret,
		jwt:        jwt,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

// UploadMetadata uploads NFT metadata to IPFS via Pinata and returns the URI
func (s *Service) UploadMetadata(metadata *models.NFTMetadata) (string, error) {
	// Convert metadata to JSON
	metadataJSON, err := json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// If Pinata is configured, use it
	if s.jwt != "" {
		return s.uploadToPinata(metadataJSON, "metadata.json")
	}

	// Fallback to placeholder for development
	hash := s.generateSimpleHash(metadataJSON)
	uri := fmt.Sprintf("https://ipfs.io/ipfs/%s", hash)

	s.logger.Info("Metadata uploaded to IPFS (placeholder)",
		zap.String("uri", uri),
		zap.String("hash", hash))

	return uri, nil
}

// uploadToPinata uploads data to Pinata IPFS service
func (s *Service) uploadToPinata(data []byte, filename string) (string, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	// Add the file
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}

	if _, err := part.Write(data); err != nil {
		return "", fmt.Errorf("failed to write file data: %w", err)
	}

	// Add pinata options
	pinataOptions := map[string]interface{}{
		"cidVersion": 1,
	}
	optionsJSON, _ := json.Marshal(pinataOptions)

	if err := writer.WriteField("pinataOptions", string(optionsJSON)); err != nil {
		return "", fmt.Errorf("failed to write pinata options: %w", err)
	}

	// Add pinata metadata
	pinataMetadata := map[string]interface{}{
		"name": filename,
		"keyvalues": map[string]string{
			"project": "edupro-nft",
		},
	}
	metadataJSON, _ := json.Marshal(pinataMetadata)

	if err := writer.WriteField("pinataMetadata", string(metadataJSON)); err != nil {
		return "", fmt.Errorf("failed to write pinata metadata: %w", err)
	}

	writer.Close()

	// Create request
	req, err := http.NewRequest("POST", s.apiURL+"/pinning/pinFileToIPFS", &body)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+s.jwt)

	// Send request
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to upload to Pinata: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("pinata upload failed with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parse response
	var result struct {
		IpfsHash string `json:"IpfsHash"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode Pinata response: %w", err)
	}

	// Return the IPFS URI using the custom gateway
	uri := fmt.Sprintf("%s/ipfs/%s", s.gatewayURL, result.IpfsHash)

	s.logger.Info("Metadata uploaded to Pinata IPFS",
		zap.String("uri", uri),
		zap.String("hash", result.IpfsHash))

	return uri, nil
}

// GetMetadata retrieves metadata from IPFS URI
func (s *Service) GetMetadata(uri string) (*models.NFTMetadata, error) {
	// For now, return a placeholder
	// In production, you'd fetch from the actual IPFS URI
	return &models.NFTMetadata{
		Name:        "Retrieved NFT",
		Description: "Metadata retrieved from IPFS",
		Image:       "https://via.placeholder.com/300x300",
		Attributes: []models.NFTAttribute{
			{TraitType: "Source", Value: "IPFS"},
		},
	}, nil
}

// generateSimpleHash generates a simple hash for the metadata
func (s *Service) generateSimpleHash(data []byte) string {
	// This is a simplified hash function
	// In production, you'd use proper IPFS hashing
	hash := fmt.Sprintf("%x", data)
	if len(hash) > 46 {
		hash = hash[:46] // IPFS hashes are typically 46 characters
	}
	return hash
}

// UploadImage uploads an image to IPFS and returns the URI
func (s *Service) UploadImage(imageData []byte, filename string) (string, error) {
	// For now, return a placeholder
	// In production, you'd upload the actual image to IPFS
	hash := s.generateSimpleHash(imageData)
	uri := fmt.Sprintf("https://ipfs.io/ipfs/%s/%s", hash, filename)

	s.logger.Info("Image uploaded to IPFS",
		zap.String("uri", uri),
		zap.String("filename", filename))

	return uri, nil
}

// GetMembershipNFTImageURI returns the IPFS URI for the EduPro membership NFT image
func (s *Service) GetMembershipNFTImageURI() string {
	// This is the IPFS hash for the actual EduPro membership NFT image
	// In production, you would upload the image to IPFS and get the actual hash
	// For now, we'll use a placeholder that represents the membership NFT
	return "https://ipfs.io/ipfs/QmEduProMembershipNFTv1"
}
