package models

import (
	"time"

	"github.com/google/uuid"
)

// NFTType represents the type of NFT
type NFTType string

const (
	NFTTypeMembership NFTType = "membership"
	NFTTypeCourse     NFTType = "course"
)

// NFTStatus represents the status of an NFT
type NFTStatus string

const (
	NFTStatusPending     NFTStatus = "pending"
	NFTStatusMinted      NFTStatus = "minted"
	NFTStatusTransferred NFTStatus = "transferred"
	NFTStatusBurned      NFTStatus = "burned"
)

// MembershipNFT represents a membership NFT given to new users
type MembershipNFT struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	UserID               uuid.UUID  `json:"user_id" db:"user_id"`
	UserEmail            string     `json:"user_email" db:"user_email"`
	WalletAddress        string     `json:"wallet_address" db:"wallet_address"`
	NFTMintAddress       string     `json:"nft_mint_address" db:"nft_mint_address"`
	NFTMetadataURI       string     `json:"nft_metadata_uri" db:"nft_metadata_uri"`
	TransactionSignature *string    `json:"transaction_signature,omitempty" db:"transaction_signature"`
	Status               NFTStatus  `json:"status" db:"status"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
	MintedAt             *time.Time `json:"minted_at,omitempty" db:"minted_at"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
}

// CourseNFTCollection represents a course NFT collection created by a creator
type CourseNFTCollection struct {
	ID                    uuid.UUID  `json:"id" db:"id"`
	CreatorID             uuid.UUID  `json:"creator_id" db:"creator_id"`
	CreatorEmail          string     `json:"creator_email" db:"creator_email"`
	CourseID              uuid.UUID  `json:"course_id" db:"course_id"`
	CourseTitle           string     `json:"course_title" db:"course_title"`
	CollectionMintAddress string     `json:"collection_mint_address" db:"collection_mint_address"`
	CollectionMetadataURI string     `json:"collection_metadata_uri" db:"collection_metadata_uri"`
	MaxSupply             int        `json:"max_supply" db:"max_supply"`
	CurrentSupply         int        `json:"current_supply" db:"current_supply"`
	PriceEduProTokens     int64      `json:"price_edutoken" db:"price_edutoken"`
	IsActive              bool       `json:"is_active" db:"is_active"`
	TransactionSignature  *string    `json:"transaction_signature,omitempty" db:"transaction_signature"`
	Status                NFTStatus  `json:"status" db:"status"`
	CreatedAt             time.Time  `json:"created_at" db:"created_at"`
	MintedAt              *time.Time `json:"minted_at,omitempty" db:"minted_at"`
	UpdatedAt             time.Time  `json:"updated_at" db:"updated_at"`
}

// CourseNFT represents an individual NFT from a course collection
type CourseNFT struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	CollectionID         uuid.UUID  `json:"collection_id" db:"collection_id"`
	OwnerID              *uuid.UUID `json:"owner_id,omitempty" db:"owner_id"`
	OwnerEmail           *string    `json:"owner_email,omitempty" db:"owner_email"`
	OwnerWalletAddress   *string    `json:"owner_wallet_address,omitempty" db:"owner_wallet_address"`
	NFTMintAddress       string     `json:"nft_mint_address" db:"nft_mint_address"`
	NFTMetadataURI       string     `json:"nft_metadata_uri" db:"nft_metadata_uri"`
	TokenID              int        `json:"token_id" db:"token_id"` // Unique token ID within the collection
	TransactionSignature *string    `json:"transaction_signature,omitempty" db:"transaction_signature"`
	Status               NFTStatus  `json:"status" db:"status"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
	MintedAt             *time.Time `json:"minted_at,omitempty" db:"minted_at"`
	TransferredAt        *time.Time `json:"transferred_at,omitempty" db:"transferred_at"`
	UpdatedAt            time.Time  `json:"updated_at" db:"updated_at"`
}

// NFTMetadata represents the metadata structure for NFTs
type NFTMetadata struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Image       string                 `json:"image"`
	Attributes  []NFTAttribute         `json:"attributes"`
	Properties  map[string]interface{} `json:"properties,omitempty"`
	ExternalURL string                 `json:"external_url,omitempty"`
}

// NFTAttribute represents an attribute of an NFT
type NFTAttribute struct {
	TraitType string      `json:"trait_type"`
	Value     interface{} `json:"value"`
}

// CreateMembershipNFTRequest represents the request to create a membership NFT
type CreateMembershipNFTRequest struct {
	UserEmail     string `json:"user_email" validate:"required,email"`
	WalletAddress string `json:"wallet_address" validate:"required"`
}

// CreateMembershipNFTResponse represents the response for creating a membership NFT
type CreateMembershipNFTResponse struct {
	NFTID                uuid.UUID `json:"nft_id"`
	UserEmail            string    `json:"user_email"`
	WalletAddress        string    `json:"wallet_address"`
	NFTMintAddress       string    `json:"nft_mint_address"`
	NFTMetadataURI       string    `json:"nft_metadata_uri"`
	TransactionSignature string    `json:"transaction_signature"`
	Status               NFTStatus `json:"status"`
	Message              string    `json:"message"`
}

// CreateCourseNFTCollectionRequest represents the request to create a course NFT collection
type CreateCourseNFTCollectionRequest struct {
	CreatorID         uuid.UUID `json:"creator_id" validate:"required"`
	CreatorEmail      string    `json:"creator_email" validate:"required,email"`
	CreatorWallet     string    `json:"creator_wallet" validate:"required"`
	CourseID          uuid.UUID `json:"course_id" validate:"required"`
	CourseTitle       string    `json:"course_title" validate:"required"`
	MaxSupply         int       `json:"max_supply" validate:"required,min=1,max=10000"`
	PriceEduProTokens int64     `json:"price_edutoken" validate:"required,min=1"`
	Description       string    `json:"description" validate:"required"`
	ImageURL          string    `json:"image_url" validate:"required,url"`
}

// CreateCourseNFTCollectionResponse represents the response for creating a course NFT collection
type CreateCourseNFTCollectionResponse struct {
	CollectionID          uuid.UUID `json:"collection_id"`
	CreatorEmail          string    `json:"creator_email"`
	CourseID              uuid.UUID `json:"course_id"`
	CourseTitle           string    `json:"course_title"`
	CollectionMintAddress string    `json:"collection_mint_address"`
	CollectionMetadataURI string    `json:"collection_metadata_uri"`
	MaxSupply             int       `json:"max_supply"`
	PriceEduProTokens     int64     `json:"price_edutoken"`
	TransactionSignature  string    `json:"transaction_signature"`
	Status                NFTStatus `json:"status"`
	Message               string    `json:"message"`
}

// PurchaseCourseNFTRequest represents the request to purchase a course NFT
type PurchaseCourseNFTRequest struct {
	CollectionID       uuid.UUID `json:"collection_id" validate:"required"`
	BuyerEmail         string    `json:"buyer_email" validate:"required,email"`
	BuyerWalletAddress string    `json:"buyer_wallet_address" validate:"required"`
}

// PurchaseCourseNFTResponse represents the response for purchasing a course NFT
type PurchaseCourseNFTResponse struct {
	NFTID                uuid.UUID `json:"nft_id"`
	CollectionID         uuid.UUID `json:"collection_id"`
	BuyerEmail           string    `json:"buyer_email"`
	BuyerWalletAddress   string    `json:"buyer_wallet_address"`
	NFTMintAddress       string    `json:"nft_mint_address"`
	NFTMetadataURI       string    `json:"nft_metadata_uri"`
	TokenID              int       `json:"token_id"`
	PriceEduProTokens    int64     `json:"price_edutoken"`
	TransactionSignature string    `json:"transaction_signature"`
	Status               NFTStatus `json:"status"`
	Message              string    `json:"message"`
}

// GetUserNFTsRequest represents the request to get user's NFTs
type GetUserNFTsRequest struct {
	UserEmail string   `json:"user_email" validate:"required,email"`
	NFTType   *NFTType `json:"nft_type,omitempty"`
}

// GetUserNFTsResponse represents the response for getting user's NFTs
type GetUserNFTsResponse struct {
	UserEmail     string         `json:"user_email"`
	MembershipNFT *MembershipNFT `json:"membership_nft,omitempty"`
	CourseNFTs    []CourseNFT    `json:"course_nfts"`
	TotalCount    int            `json:"total_count"`
}

// GetCourseNFTCollectionRequest represents the request to get course NFT collection details
type GetCourseNFTCollectionRequest struct {
	CollectionID uuid.UUID `json:"collection_id" validate:"required"`
}

// GetCourseNFTCollectionResponse represents the response for getting course NFT collection details
type GetCourseNFTCollectionResponse struct {
	Collection     CourseNFTCollection `json:"collection"`
	AvailableNFTs  []CourseNFT         `json:"available_nfts"`
	OwnedNFTs      []CourseNFT         `json:"owned_nfts"`
	TotalAvailable int                 `json:"total_available"`
	TotalOwned     int                 `json:"total_owned"`
}

// TransferNFTRequest represents the request to transfer an NFT
type TransferNFTRequest struct {
	NFTMintAddress  string `json:"nft_mint_address" validate:"required"`
	FromEmail       string `json:"from_email" validate:"required,email"`
	ToEmail         string `json:"to_email" validate:"required,email"`
	ToWalletAddress string `json:"to_wallet_address" validate:"required"`
}

// TransferNFTResponse represents the response for transferring an NFT
type TransferNFTResponse struct {
	NFTMintAddress       string    `json:"nft_mint_address"`
	FromEmail            string    `json:"from_email"`
	ToEmail              string    `json:"to_email"`
	ToWalletAddress      string    `json:"to_wallet_address"`
	TransactionSignature string    `json:"transaction_signature"`
	Status               NFTStatus `json:"status"`
	Message              string    `json:"message"`
}
