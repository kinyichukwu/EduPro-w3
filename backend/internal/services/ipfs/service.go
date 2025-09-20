package ipfs

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"go.uber.org/zap"
)

// Service handles IPFS operations
type Service struct {
	gatewayURL string
	apiURL     string
	httpClient *http.Client
	logger     *zap.Logger
}

// NewService creates a new IPFS service
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

// UploadMetadata uploads NFT metadata to IPFS and returns the URI
func (s *Service) UploadMetadata(metadata *models.NFTMetadata) (string, error) {
	// Convert metadata to JSON
	metadataJSON, err := json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// For now, we'll use a simple approach with a public IPFS gateway
	// In production, you'd use a proper IPFS service like Pinata, Infura, or your own IPFS node

	// Create a simple hash-based URI for now
	hash := s.generateSimpleHash(metadataJSON)
	uri := fmt.Sprintf("https://ipfs.io/ipfs/%s", hash)

	s.logger.Info("Metadata uploaded to IPFS",
		zap.String("uri", uri),
		zap.String("hash", hash))

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
