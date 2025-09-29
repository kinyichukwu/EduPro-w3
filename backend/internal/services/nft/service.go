package nft

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/metaplex"
	"go.uber.org/zap"
)

// Service handles NFT operations
type Service struct {
	config          *config.SolanaConfig
	rpcClient       *rpc.Client
	dbClient        *database.Client
	metaplexService *metaplex.Service
	logger          *zap.Logger
}

// NewService creates a new NFT service
func NewService(cfg *config.SolanaConfig, dbClient *database.Client, logger *zap.Logger) (*Service, error) {
	rpcClient := rpc.New(cfg.RPCEndpoint)

	// Initialize Metaplex service
	metaplexService, err := metaplex.NewService(cfg, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Metaplex service: %w", err)
	}

	return &Service{
		config:          cfg,
		rpcClient:       rpcClient,
		dbClient:        dbClient,
		metaplexService: metaplexService,
		logger:          logger,
	}, nil
}

// CreateMembershipNFT creates a membership NFT for a new user
func (s *Service) CreateMembershipNFT(ctx context.Context, req *models.CreateMembershipNFTRequest) (*models.CreateMembershipNFTResponse, error) {
	// Check if user already has a membership NFT
	existingNFT, err := s.dbClient.GetMembershipNFTByEmail(req.UserEmail)
	if err == nil && existingNFT != nil {
		return nil, fmt.Errorf("user already has a membership NFT")
	}

	// Generate unique NFT metadata
	metadata := s.generateMembershipNFTMetadata(req.UserEmail)
	metadataURI, err := s.uploadMetadata(metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to upload metadata: %w", err)
	}

	// Create NFT mint address
	nftMintAddress, err := s.generateNFTMintAddress()
	if err != nil {
		return nil, fmt.Errorf("failed to generate NFT mint address: %w", err)
	}

	// Create membership NFT record
	nftID := uuid.New()
	membershipNFT := &models.MembershipNFT{
		ID:             nftID,
		UserEmail:      req.UserEmail,
		WalletAddress:  req.WalletAddress,
		NFTMintAddress: nftMintAddress,
		NFTMetadataURI: metadataURI,
		Status:         models.NFTStatusPending,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Save to database
	err = s.dbClient.CreateMembershipNFT(membershipNFT)
	if err != nil {
		return nil, fmt.Errorf("failed to save membership NFT: %w", err)
	}

	// Get user by email to update their profile with NFT address
	user, err := s.dbClient.GetUserByEmail(req.UserEmail)
	if err == nil && user != nil {
		// Update user's profile with membership NFT address
		err = s.dbClient.UpdateUserMembershipNFT(user.ID, nftMintAddress)
		if err != nil {
			s.logger.Warn("Failed to update user profile with NFT address",
				zap.String("user_email", req.UserEmail),
				zap.String("nft_address", nftMintAddress),
				zap.Error(err))
			// Don't fail the NFT creation if profile update fails
		}
	}

	// Create mint transaction using Metaplex
	transaction, err := s.metaplexService.CreateMembershipNFT(ctx, req.WalletAddress, metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to create mint transaction: %w", err)
	}

	// Serialize transaction
	txBytes, err := transaction.MarshalBinary()
	if err != nil {
		return nil, fmt.Errorf("failed to serialize transaction: %w", err)
	}
	txBase64 := base64.StdEncoding.EncodeToString(txBytes)

	return &models.CreateMembershipNFTResponse{
		NFTID:                nftID,
		UserEmail:            req.UserEmail,
		WalletAddress:        req.WalletAddress,
		NFTMintAddress:       nftMintAddress,
		NFTMetadataURI:       metadataURI,
		TransactionSignature: txBase64,
		Status:               models.NFTStatusPending,
		Message:              "Membership NFT created successfully. Please sign the transaction to mint it.",
	}, nil
}

// CreateCourseNFTCollection creates a course NFT collection for a creator
func (s *Service) CreateCourseNFTCollection(ctx context.Context, req *models.CreateCourseNFTCollectionRequest) (*models.CreateCourseNFTCollectionResponse, error) {
	// Check if collection already exists for this course
	existingCollection, err := s.dbClient.GetCourseNFTCollectionByCourseID(req.CourseID)
	if err == nil && existingCollection != nil {
		return nil, fmt.Errorf("course already has an NFT collection")
	}

	// Generate unique collection metadata
	metadata := s.generateCourseNFTCollectionMetadata(req.CourseTitle, req.Description, req.ImageURL, req.MaxSupply)
	metadataURI, err := s.uploadMetadata(metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to upload collection metadata: %w", err)
	}

	// Create collection mint address
	collectionMintAddress, err := s.generateNFTMintAddress()
	if err != nil {
		return nil, fmt.Errorf("failed to generate collection mint address: %w", err)
	}

	// Create collection record
	collectionID := uuid.New()
	collection := &models.CourseNFTCollection{
		ID:                    collectionID,
		CreatorID:             req.CreatorID,
		CreatorEmail:          req.CreatorEmail,
		CourseID:              req.CourseID,
		CourseTitle:           req.CourseTitle,
		CollectionMintAddress: collectionMintAddress,
		CollectionMetadataURI: metadataURI,
		MaxSupply:             req.MaxSupply,
		CurrentSupply:         0,
		PriceEduProTokens:     req.PriceEduProTokens,
		IsActive:              true,
		Status:                models.NFTStatusPending,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	// Save to database
	err = s.dbClient.CreateCourseNFTCollection(collection)
	if err != nil {
		return nil, fmt.Errorf("failed to save course NFT collection: %w", err)
	}

	// Create collection mint transaction using Metaplex
	transaction, err := s.metaplexService.CreateCourseNFTCollection(ctx, req.CreatorWallet, metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to create collection mint transaction: %w", err)
	}

	// Serialize transaction
	txBytes, err := transaction.MarshalBinary()
	if err != nil {
		return nil, fmt.Errorf("failed to serialize transaction: %w", err)
	}
	txBase64 := base64.StdEncoding.EncodeToString(txBytes)

	return &models.CreateCourseNFTCollectionResponse{
		CollectionID:          collectionID,
		CreatorEmail:          req.CreatorEmail,
		CourseID:              req.CourseID,
		CourseTitle:           req.CourseTitle,
		CollectionMintAddress: collectionMintAddress,
		CollectionMetadataURI: metadataURI,
		MaxSupply:             req.MaxSupply,
		PriceEduProTokens:     req.PriceEduProTokens,
		TransactionSignature:  txBase64,
		Status:                models.NFTStatusPending,
		Message:               "Course NFT collection created successfully. Please sign the transaction to mint it.",
	}, nil
}

// PurchaseCourseNFT purchases a course NFT using EduPro tokens
func (s *Service) PurchaseCourseNFT(ctx context.Context, req *models.PurchaseCourseNFTRequest) (*models.PurchaseCourseNFTResponse, error) {
	// Get collection details
	collection, err := s.dbClient.GetCourseNFTCollectionByID(req.CollectionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get collection: %w", err)
	}

	if !collection.IsActive {
		return nil, fmt.Errorf("collection is not active")
	}

	// Note: For course NFTs, multiple users can own NFTs from the same collection.
	// Each purchase creates a unique NFT for the buyer, so we don't check for existing ownership.
	// The course purchase logic in the handler already prevents duplicate purchases per user.

	// Check user's EduPro token balance
	balance, err := s.getEduProTokenBalance(ctx, req.BuyerWalletAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to get token balance: %w", err)
	}

	if balance < uint64(collection.PriceEduProTokens) {
		return nil, fmt.Errorf("insufficient EduPro token balance")
	}

	// Atomically increment supply and get unique token ID
	// This prevents race conditions when multiple users purchase simultaneously
	tokenID, err := s.dbClient.IncrementCourseNFTCollectionSupply(req.CollectionID)
	if err != nil {
		return nil, fmt.Errorf("failed to increment collection supply: %w", err)
	}

	// Create NFT record with retry on duplicate token id (extreme concurrency safety)
	nftID := uuid.New()
	var metadata *models.NFTMetadata
	var metadataURI string
	var nftMintAddress string

	for attempt := 0; attempt < 3; attempt++ {
		// Generate metadata for current tokenID and upload
		metadata = s.generateCourseNFTMetadata(collection.CourseTitle, tokenID, collection.MaxSupply)
		metadataURI, err = s.uploadMetadata(metadata)
		if err != nil {
			return nil, fmt.Errorf("failed to upload NFT metadata: %w", err)
		}

		// Generate a new mint address for this attempt
		nftMintAddress, err = s.generateNFTMintAddress()
		if err != nil {
			return nil, fmt.Errorf("failed to generate NFT mint address: %w", err)
		}

		courseNFT := &models.CourseNFT{
			ID:                 nftID,
			CollectionID:       req.CollectionID,
			OwnerEmail:         &req.BuyerEmail,
			OwnerWalletAddress: &req.BuyerWalletAddress,
			NFTMintAddress:     nftMintAddress,
			NFTMetadataURI:     metadataURI,
			TokenID:            tokenID,
			Status:             models.NFTStatusPending,
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}

		// Save to database
		err = s.dbClient.CreateCourseNFT(courseNFT)
		if err == nil {
			break
		}
		// If duplicate (collection_id, token_id), get a new token id and retry
		if strings.Contains(err.Error(), "course_nfts_collection_id_token_id_key") || strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "SQLSTATE 23505") {
			// Get next token id atomically
			var nextErr error
			tokenID, nextErr = s.dbClient.IncrementCourseNFTCollectionSupply(req.CollectionID)
			if nextErr != nil {
				return nil, fmt.Errorf("failed to increment collection supply on retry: %w", nextErr)
			}
			// Retry loop continues with new tokenID
			continue
		}
		// Non-duplicate error
		return nil, fmt.Errorf("failed to save course NFT: %w", err)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to save course NFT after retries: %w", err)
	}

	// Create purchase transaction using Metaplex
	transaction, err := s.metaplexService.MintCourseNFT(
		ctx,
		collection.CollectionMintAddress,
		req.BuyerWalletAddress,
		tokenID,
		metadata,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create purchase transaction: %w", err)
	}

	// Serialize transaction
	txBytes, err := transaction.MarshalBinary()
	if err != nil {
		return nil, fmt.Errorf("failed to serialize transaction: %w", err)
	}
	txBase64 := base64.StdEncoding.EncodeToString(txBytes)

	return &models.PurchaseCourseNFTResponse{
		NFTID:                nftID,
		CollectionID:         req.CollectionID,
		BuyerEmail:           req.BuyerEmail,
		BuyerWalletAddress:   req.BuyerWalletAddress,
		NFTMintAddress:       nftMintAddress,
		NFTMetadataURI:       metadataURI,
		TokenID:              tokenID,
		PriceEduProTokens:    collection.PriceEduProTokens,
		TransactionSignature: txBase64,
		Status:               models.NFTStatusPending,
		Message:              "Course NFT purchase transaction created successfully. Please sign the transaction to complete the purchase.",
	}, nil
}

// GetUserNFTs retrieves all NFTs owned by a user
func (s *Service) GetUserNFTs(ctx context.Context, req *models.GetUserNFTsRequest) (*models.GetUserNFTsResponse, error) {
	var membershipNFT *models.MembershipNFT
	var courseNFTs []models.CourseNFT

	// Get membership NFT
	if req.NFTType == nil || *req.NFTType == models.NFTTypeMembership {
		membershipNFT, _ = s.dbClient.GetMembershipNFTByEmail(req.UserEmail)
	}

	// Get course NFTs
	if req.NFTType == nil || *req.NFTType == models.NFTTypeCourse {
		courseNFTs, _ = s.dbClient.GetCourseNFTsByOwnerEmail(req.UserEmail)
	}

	totalCount := 0
	if membershipNFT != nil {
		totalCount++
	}
	totalCount += len(courseNFTs)

	return &models.GetUserNFTsResponse{
		UserEmail:     req.UserEmail,
		MembershipNFT: membershipNFT,
		CourseNFTs:    courseNFTs,
		TotalCount:    totalCount,
	}, nil
}

// GetCourseNFTCollection retrieves course NFT collection details
func (s *Service) GetCourseNFTCollection(ctx context.Context, req *models.GetCourseNFTCollectionRequest) (*models.GetCourseNFTCollectionResponse, error) {
	// Get collection
	collection, err := s.dbClient.GetCourseNFTCollectionByID(req.CollectionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get collection: %w", err)
	}

	// Get available NFTs (not yet owned)
	availableNFTs, err := s.dbClient.GetAvailableCourseNFTsByCollectionID(req.CollectionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get available NFTs: %w", err)
	}

	// Get owned NFTs
	ownedNFTs, err := s.dbClient.GetCourseNFTsByCollectionID(req.CollectionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get owned NFTs: %w", err)
	}

	return &models.GetCourseNFTCollectionResponse{
		Collection:     *collection,
		AvailableNFTs:  availableNFTs,
		OwnedNFTs:      ownedNFTs,
		TotalAvailable: len(availableNFTs),
		TotalOwned:     len(ownedNFTs),
	}, nil
}

// Helper methods

// generateMembershipNFTMetadata generates metadata for membership NFT
func (s *Service) generateMembershipNFTMetadata(userEmail string) *models.NFTMetadata {
	// Get the actual membership NFT image URI from IPFS
	imageURI := s.metaplexService.GetMembershipNFTImageURI()

	return &models.NFTMetadata{
		Name:        "EduPro Membership NFT",
		Description: fmt.Sprintf("Welcome to EduPro! This exclusive membership NFT grants you access to premium educational content, community features, and special rewards. A futuristic digital token representing your journey in the EduPro learning ecosystem. Owner: %s", userEmail),
		Image:       imageURI,
		Attributes: []models.NFTAttribute{
			{TraitType: "Type", Value: "Membership"},
			{TraitType: "Platform", Value: "EduPro"},
			{TraitType: "Rarity", Value: "Exclusive"},
			{TraitType: "Tier", Value: "Premium"},
			{TraitType: "Owner Email", Value: userEmail},
			{TraitType: "Design", Value: "Futuristic Hexagonal Prism"},
			{TraitType: "Theme", Value: "Digital Education"},
			{TraitType: "Collection", Value: "EduPro Genesis"},
		},
		Properties: map[string]interface{}{
			"membership_tier": "premium",
			"benefits":        []string{"access_to_premium_content", "community_features", "special_rewards", "early_access"},
			"created_at":      time.Now().Format(time.RFC3339),
			"design_version":  "v1.0",
			"collection":      "EduPro Genesis Membership",
		},
		ExternalURL: "https://edupro.com/membership",
	}
}

// generateCourseNFTCollectionMetadata generates metadata for course NFT collection
func (s *Service) generateCourseNFTCollectionMetadata(courseTitle, description, imageURL string, maxSupply int) *models.NFTMetadata {
	return &models.NFTMetadata{
		Name:        fmt.Sprintf("%s - Course Collection", courseTitle),
		Description: description,
		Image:       imageURL,
		Attributes: []models.NFTAttribute{
			{TraitType: "Type", Value: "Course Collection"},
			{TraitType: "Platform", Value: "EduPro"},
			{TraitType: "Max Supply", Value: maxSupply},
			{TraitType: "Course", Value: courseTitle},
		},
		Properties: map[string]interface{}{
			"collection_type": "course",
			"created_at":      time.Now().Format(time.RFC3339),
		},
		ExternalURL: "https://edupro.com",
	}
}

// generateCourseNFTMetadata generates metadata for individual course NFT
func (s *Service) generateCourseNFTMetadata(courseTitle string, tokenID, maxSupply int) *models.NFTMetadata {
	rarity := "Common"
	if tokenID <= maxSupply/10 {
		rarity = "Rare"
	} else if tokenID <= maxSupply/3 {
		rarity = "Uncommon"
	}

	return &models.NFTMetadata{
		Name:        fmt.Sprintf("%s #%d", courseTitle, tokenID),
		Description: fmt.Sprintf("Access NFT for %s course. Token #%d of %d", courseTitle, tokenID, maxSupply),
		Image:       fmt.Sprintf("https://edupro.com/images/course-nft-%d.png", tokenID), // TODO: Replace with actual image generation
		Attributes: []models.NFTAttribute{
			{TraitType: "Type", Value: "Course Access"},
			{TraitType: "Platform", Value: "EduPro"},
			{TraitType: "Course", Value: courseTitle},
			{TraitType: "Token ID", Value: tokenID},
			{TraitType: "Rarity", Value: rarity},
		},
		Properties: map[string]interface{}{
			"course_access": true,
			"token_id":      tokenID,
			"max_supply":    maxSupply,
			"created_at":    time.Now().Format(time.RFC3339),
		},
		ExternalURL: "https://edupro.com",
	}
}

// uploadMetadata uploads metadata to IPFS or similar service
func (s *Service) uploadMetadata(metadata *models.NFTMetadata) (string, error) {
	// TODO: Implement actual metadata upload to IPFS or similar service
	// For now, return a placeholder URI
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return "", fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// In a real implementation, you would upload to IPFS and get the hash
	// For now, we'll create a base64 encoded placeholder
	encoded := base64.StdEncoding.EncodeToString(metadataJSON)
	return fmt.Sprintf("https://edupro.com/metadata/%s", encoded), nil
}

// generateNFTMintAddress generates a unique NFT mint address
func (s *Service) generateNFTMintAddress() (string, error) {
	// Generate a random keypair for the NFT mint
	keypair, err := solana.NewRandomPrivateKey()
	if err != nil {
		return "", fmt.Errorf("failed to generate keypair: %w", err)
	}

	return keypair.PublicKey().String(), nil
}

// getEduProTokenBalance gets the EduPro token balance for a wallet
func (s *Service) getEduProTokenBalance(ctx context.Context, walletAddress string) (uint64, error) {
	walletPubKey, err := solana.PublicKeyFromBase58(walletAddress)
	if err != nil {
		return 0, fmt.Errorf("invalid wallet address: %w", err)
	}

	mintPubKey, err := solana.PublicKeyFromBase58(s.config.EduProTokenMint)
	if err != nil {
		return 0, fmt.Errorf("invalid mint address: %w", err)
	}

	// Get token accounts for the wallet
	tokenAccounts, err := s.rpcClient.GetTokenAccountsByOwner(
		ctx,
		walletPubKey,
		&rpc.GetTokenAccountsConfig{
			Mint: &mintPubKey,
		},
		&rpc.GetTokenAccountsOpts{
			Commitment: rpc.CommitmentFinalized,
		},
	)
	if err != nil {
		return 0, fmt.Errorf("failed to get token accounts: %w", err)
	}

	if len(tokenAccounts.Value) == 0 {
		return 0, nil // No token account found, balance is 0
	}

	// Get balance from the first token account
	tokenAccount := tokenAccounts.Value[0]
	balance, err := s.rpcClient.GetTokenAccountBalance(ctx, tokenAccount.Pubkey, rpc.CommitmentFinalized)
	if err != nil {
		return 0, fmt.Errorf("failed to get token balance: %w", err)
	}

	// Parse the amount string to uint64
	amount, err := strconv.ParseUint(balance.Value.Amount, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to parse token balance: %w", err)
	}

	return amount, nil
}

// GetMintAddressFromTransaction extracts the mint address from a transaction
func (s *Service) GetMintAddressFromTransaction(transaction *solana.Transaction) (string, error) {
	// TODO: Parse the transaction to extract the mint address
	// For now, return a placeholder
	return "placeholder_mint_address", nil
}

// VerifyNFTOwnership verifies if a user owns an NFT
func (s *Service) VerifyNFTOwnership(ctx context.Context, mintAddress, userWallet string) (bool, error) {
	return s.metaplexService.VerifyNFTOwnership(ctx, mintAddress, userWallet)
}

// GetNFTMetadata retrieves NFT metadata from on-chain
func (s *Service) GetNFTMetadata(ctx context.Context, mintAddress string) (*models.NFTMetadata, error) {
	return s.metaplexService.GetNFTMetadata(ctx, mintAddress)
}
