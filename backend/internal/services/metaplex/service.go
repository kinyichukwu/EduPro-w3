package metaplex

import (
	"context"
	"fmt"

	"github.com/gagliardetto/solana-go"
	associatedtokenaccount "github.com/gagliardetto/solana-go/programs/associated-token-account"
	"github.com/gagliardetto/solana-go/programs/system"
	"github.com/gagliardetto/solana-go/programs/token"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/ipfs"
	"go.uber.org/zap"
)

// Metaplex program IDs
const (
	// Metaplex Token Metadata Program ID
	TokenMetadataProgramID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"

	// Metaplex Candy Machine Program ID (for collections)
	CandyMachineProgramID = "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"

	// System Program ID
	SystemProgramID = "11111111111111111111111111111111"

	// Token Program ID
	TokenProgramID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

	// Associated Token Program ID
	AssociatedTokenProgramID = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
)

// Service handles Metaplex NFT operations
type Service struct {
	config      *config.SolanaConfig
	rpcClient   *rpc.Client
	ipfsService *ipfs.Service
	logger      *zap.Logger

	// Metaplex program IDs
	tokenMetadataProgram   solana.PublicKey
	candyMachineProgram    solana.PublicKey
	systemProgram          solana.PublicKey
	tokenProgram           solana.PublicKey
	associatedTokenProgram solana.PublicKey
}

// NewService creates a new Metaplex service
func NewService(cfg *config.SolanaConfig, logger *zap.Logger) (*Service, error) {
	rpcClient := rpc.New(cfg.RPCEndpoint)

	// Initialize IPFS service
	ipfsService := ipfs.NewService(
		"https://ipfs.io/ipfs/",   // Gateway URL
		"https://ipfs.io/api/v0/", // API URL
		logger,
	)

	// Parse program IDs
	tokenMetadataProgram, err := solana.PublicKeyFromBase58(TokenMetadataProgramID)
	if err != nil {
		return nil, fmt.Errorf("invalid token metadata program ID: %w", err)
	}

	candyMachineProgram, err := solana.PublicKeyFromBase58(CandyMachineProgramID)
	if err != nil {
		return nil, fmt.Errorf("invalid candy machine program ID: %w", err)
	}

	systemProgram, err := solana.PublicKeyFromBase58(SystemProgramID)
	if err != nil {
		return nil, fmt.Errorf("invalid system program ID: %w", err)
	}

	tokenProgram, err := solana.PublicKeyFromBase58(TokenProgramID)
	if err != nil {
		return nil, fmt.Errorf("invalid token program ID: %w", err)
	}

	associatedTokenProgram, err := solana.PublicKeyFromBase58(AssociatedTokenProgramID)
	if err != nil {
		return nil, fmt.Errorf("invalid associated token program ID: %w", err)
	}

	return &Service{
		config:                 cfg,
		rpcClient:              rpcClient,
		ipfsService:            ipfsService,
		logger:                 logger,
		tokenMetadataProgram:   tokenMetadataProgram,
		candyMachineProgram:    candyMachineProgram,
		systemProgram:          systemProgram,
		tokenProgram:           tokenProgram,
		associatedTokenProgram: associatedTokenProgram,
	}, nil
}

// CreateMembershipNFT creates a membership NFT on-chain
func (s *Service) CreateMembershipNFT(ctx context.Context, userWallet string, metadata *models.NFTMetadata) (*solana.Transaction, error) {
	// Generate new mint keypair
	mintKeypair, err := solana.NewRandomPrivateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate mint keypair: %w", err)
	}
	mint := mintKeypair.PublicKey()

	// Parse user wallet
	userWalletPubKey, err := solana.PublicKeyFromBase58(userWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid user wallet address: %w", err)
	}

	// Get recent blockhash
	recentBlockhash, err := s.rpcClient.GetRecentBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Create metadata account address
	metadataAccount, err := s.getMetadataAccountAddress(mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get metadata account address: %w", err)
	}

	// Create master edition account address
	masterEditionAccount, err := s.getMasterEditionAccountAddress(mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get master edition account address: %w", err)
	}

	// Create associated token account address
	associatedTokenAccount, err := s.getAssociatedTokenAccountAddress(userWalletPubKey, mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get associated token account address: %w", err)
	}

	// Upload metadata to IPFS (placeholder for now)
	metadataURI, err := s.uploadMetadataToIPFS(metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to upload metadata: %w", err)
	}

	// Create instructions
	instructions := []solana.Instruction{}

	// 1. Create mint account
	createMintInstruction := system.NewCreateAccountInstruction(
		0,  // lamports (will be calculated)
		82, // space for mint account
		s.tokenProgram,
		userWalletPubKey, // payer
		mint,             // new account
	).Build()
	instructions = append(instructions, createMintInstruction)

	// 2. Initialize mint
	initMintInstruction := token.NewInitializeMintInstruction(
		0, // decimals (0 for NFTs)
		mint,
		mint,                    // mint authority (self for NFTs)
		solana.PublicKey{},      // freeze authority (empty for NFTs)
		solana.SysVarRentPubkey, // rent sysvar
	).Build()
	instructions = append(instructions, initMintInstruction)

	// 3. Create associated token account
	createATAInstruction := associatedtokenaccount.NewCreateInstruction(
		userWalletPubKey, // payer
		userWalletPubKey, // owner
		mint,             // mint
	).Build()
	instructions = append(instructions, createATAInstruction)

	// 4. Mint token to user
	mintToInstruction := token.NewMintToInstruction(
		1, // amount (1 for NFTs)
		mint,
		associatedTokenAccount,
		mint, // mint authority
		nil,  // signers
	).Build()
	instructions = append(instructions, mintToInstruction)

	// 5. Create metadata account
	metadataData := MetadataData{
		Name:                 metadata.Name,
		Symbol:               "EDUPRO",
		URI:                  metadataURI,
		SellerFeeBasisPoints: 0, // No royalties for membership NFTs
		Creators:             nil,
		Collection:           nil,
		Uses:                 nil,
	}

	createMetadataInstruction := s.CreateMetadataAccountV3(
		metadataAccount,
		mint,
		userWalletPubKey, // mint authority
		userWalletPubKey, // payer
		userWalletPubKey, // update authority
		metadataData,
		true, // is_mutable
	)
	instructions = append(instructions, createMetadataInstruction)

	// 6. Create master edition
	createMasterEditionInstruction := s.CreateMasterEditionV3(
		masterEditionAccount,
		mint,
		userWalletPubKey, // update authority
		userWalletPubKey, // mint authority
		userWalletPubKey, // payer
		nil,              // max_supply (nil for single NFT)
	)
	instructions = append(instructions, createMasterEditionInstruction)

	// Create transaction
	transaction, err := solana.NewTransaction(
		instructions,
		recentBlockhash.Value.Blockhash,
		solana.TransactionPayer(userWalletPubKey),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// CreateCourseNFTCollection creates a course NFT collection on-chain
func (s *Service) CreateCourseNFTCollection(ctx context.Context, creatorWallet string, metadata *models.NFTMetadata) (*solana.Transaction, error) {
	// Generate new mint keypair for collection
	mintKeypair, err := solana.NewRandomPrivateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate collection mint keypair: %w", err)
	}
	mint := mintKeypair.PublicKey()

	// Parse creator wallet
	creatorWalletPubKey, err := solana.PublicKeyFromBase58(creatorWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid creator wallet address: %w", err)
	}

	// Get recent blockhash
	recentBlockhash, err := s.rpcClient.GetRecentBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Create metadata account address
	metadataAccount, err := s.getMetadataAccountAddress(mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get metadata account address: %w", err)
	}

	// Create master edition account address
	masterEditionAccount, err := s.getMasterEditionAccountAddress(mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get master edition account address: %w", err)
	}

	// Upload metadata to IPFS
	metadataURI, err := s.uploadMetadataToIPFS(metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to upload metadata: %w", err)
	}

	// Create instructions
	instructions := []solana.Instruction{}

	// 1. Create mint account
	createMintInstruction := system.NewCreateAccountInstruction(
		0,  // lamports (will be calculated)
		82, // space for mint account
		s.tokenProgram,
		creatorWalletPubKey, // payer
		mint,                // new account
	).Build()
	instructions = append(instructions, createMintInstruction)

	// 2. Initialize mint
	initMintInstruction := token.NewInitializeMintInstruction(
		0, // decimals (0 for NFTs)
		mint,
		mint,                    // mint authority (self for NFTs)
		solana.PublicKey{},      // freeze authority (empty for NFTs)
		solana.SysVarRentPubkey, // rent sysvar
	).Build()
	instructions = append(instructions, initMintInstruction)

	// 3. Create metadata account
	metadataData := MetadataData{
		Name:                 metadata.Name,
		Symbol:               "EDUPRO",
		URI:                  metadataURI,
		SellerFeeBasisPoints: 0, // No royalties for collections
		Creators:             nil,
		Collection:           nil,
		Uses:                 nil,
	}

	createMetadataInstruction := s.CreateMetadataAccountV3(
		metadataAccount,
		mint,
		creatorWalletPubKey, // mint authority
		creatorWalletPubKey, // payer
		creatorWalletPubKey, // update authority
		metadataData,
		true, // is_mutable
	)
	instructions = append(instructions, createMetadataInstruction)

	// 4. Create master edition (collection)
	createMasterEditionInstruction := s.CreateMasterEditionV3(
		masterEditionAccount,
		mint,
		creatorWalletPubKey, // update authority
		creatorWalletPubKey, // mint authority
		creatorWalletPubKey, // payer
		nil,                 // max_supply (nil for unlimited collection)
	)
	instructions = append(instructions, createMasterEditionInstruction)

	// Create transaction
	transaction, err := solana.NewTransaction(
		instructions,
		recentBlockhash.Value.Blockhash,
		solana.TransactionPayer(creatorWalletPubKey),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// MintCourseNFT mints a course NFT from a collection
func (s *Service) MintCourseNFT(ctx context.Context, collectionMint, userWallet string, tokenID int, metadata *models.NFTMetadata) (*solana.Transaction, error) {
	// Generate new mint keypair for the NFT
	mintKeypair, err := solana.NewRandomPrivateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate NFT mint keypair: %w", err)
	}
	mint := mintKeypair.PublicKey()

	// Parse addresses
	collectionMintPubKey, err := solana.PublicKeyFromBase58(collectionMint)
	if err != nil {
		return nil, fmt.Errorf("invalid collection mint address: %w", err)
	}

	userWalletPubKey, err := solana.PublicKeyFromBase58(userWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid user wallet address: %w", err)
	}

	// Get recent blockhash
	recentBlockhash, err := s.rpcClient.GetRecentBlockhash(ctx, rpc.CommitmentFinalized)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Create metadata account address
	metadataAccount, err := s.getMetadataAccountAddress(mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get metadata account address: %w", err)
	}

	// Create master edition account address
	masterEditionAccount, err := s.getMasterEditionAccountAddress(mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get master edition account address: %w", err)
	}

	// Create associated token account address
	associatedTokenAccount, err := s.getAssociatedTokenAccountAddress(userWalletPubKey, mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get associated token account address: %w", err)
	}

	// Upload metadata to IPFS
	metadataURI, err := s.uploadMetadataToIPFS(metadata)
	if err != nil {
		return nil, fmt.Errorf("failed to upload metadata: %w", err)
	}

	// Create instructions
	instructions := []solana.Instruction{}

	// 1. Create mint account
	createMintInstruction := system.NewCreateAccountInstruction(
		0,  // lamports (will be calculated)
		82, // space for mint account
		s.tokenProgram,
		userWalletPubKey, // payer
		mint,             // new account
	).Build()
	instructions = append(instructions, createMintInstruction)

	// 2. Initialize mint
	initMintInstruction := token.NewInitializeMintInstruction(
		0, // decimals (0 for NFTs)
		mint,
		mint,                    // mint authority (self for NFTs)
		solana.PublicKey{},      // freeze authority (empty for NFTs)
		solana.SysVarRentPubkey, // rent sysvar
	).Build()
	instructions = append(instructions, initMintInstruction)

	// 3. Create associated token account
	createATAInstruction := associatedtokenaccount.NewCreateInstruction(
		userWalletPubKey, // payer
		userWalletPubKey, // owner
		mint,             // mint
	).Build()
	instructions = append(instructions, createATAInstruction)

	// 4. Mint token to user
	mintToInstruction := token.NewMintToInstruction(
		1, // amount (1 for NFTs)
		mint,
		associatedTokenAccount,
		mint, // mint authority
		nil,  // signers
	).Build()
	instructions = append(instructions, mintToInstruction)

	// 5. Create metadata account with collection reference
	metadataData := MetadataData{
		Name:                 metadata.Name,
		Symbol:               "EDUPRO",
		URI:                  metadataURI,
		SellerFeeBasisPoints: 0, // No royalties
		Creators:             nil,
		Collection: &Collection{
			Verified: false, // Will be verified later
			Key:      collectionMintPubKey,
		},
		Uses: nil,
	}

	createMetadataInstruction := s.CreateMetadataAccountV3(
		metadataAccount,
		mint,
		userWalletPubKey, // mint authority
		userWalletPubKey, // payer
		userWalletPubKey, // update authority
		metadataData,
		true, // is_mutable
	)
	instructions = append(instructions, createMetadataInstruction)

	// 6. Create master edition
	createMasterEditionInstruction := s.CreateMasterEditionV3(
		masterEditionAccount,
		mint,
		userWalletPubKey, // update authority
		userWalletPubKey, // mint authority
		userWalletPubKey, // payer
		nil,              // max_supply (nil for single NFT)
	)
	instructions = append(instructions, createMasterEditionInstruction)

	// Create transaction
	transaction, err := solana.NewTransaction(
		instructions,
		recentBlockhash.Value.Blockhash,
		solana.TransactionPayer(userWalletPubKey),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// Helper methods

// uploadMetadataToIPFS uploads metadata to IPFS and returns the URI
func (s *Service) uploadMetadataToIPFS(metadata *models.NFTMetadata) (string, error) {
	return s.ipfsService.UploadMetadata(metadata)
}

// GetMembershipNFTImageURI returns the IPFS URI for the EduPro membership NFT image
func (s *Service) GetMembershipNFTImageURI() string {
	return s.ipfsService.GetMembershipNFTImageURI()
}

// GetNFTMetadata retrieves NFT metadata from on-chain
func (s *Service) GetNFTMetadata(ctx context.Context, mintAddress string) (*models.NFTMetadata, error) {
	// Parse mint address
	mint, err := solana.PublicKeyFromBase58(mintAddress)
	if err != nil {
		return nil, fmt.Errorf("invalid mint address: %w", err)
	}

	// Get metadata account address
	metadataAccount, err := s.getMetadataAccountAddress(mint)
	if err != nil {
		return nil, fmt.Errorf("failed to get metadata account address: %w", err)
	}

	// Get account info
	accountInfo, err := s.rpcClient.GetAccountInfo(ctx, metadataAccount)
	if err != nil {
		return nil, fmt.Errorf("failed to get metadata account info: %w", err)
	}

	if accountInfo.Value == nil {
		return nil, fmt.Errorf("metadata account not found")
	}

	// TODO: Parse the actual metadata account data
	// For now, return a placeholder
	return &models.NFTMetadata{
		Name:        "Placeholder NFT",
		Description: "This is a placeholder NFT metadata",
		Image:       "https://via.placeholder.com/300x300",
		Attributes: []models.NFTAttribute{
			{TraitType: "Type", Value: "Placeholder"},
		},
	}, nil
}

// VerifyNFTOwnership verifies if a user owns an NFT
func (s *Service) VerifyNFTOwnership(ctx context.Context, mintAddress, userWallet string) (bool, error) {
	// Parse addresses
	mint, err := solana.PublicKeyFromBase58(mintAddress)
	if err != nil {
		return false, fmt.Errorf("invalid mint address: %w", err)
	}

	userWalletPubKey, err := solana.PublicKeyFromBase58(userWallet)
	if err != nil {
		return false, fmt.Errorf("invalid user wallet address: %w", err)
	}

	// Get associated token account address
	associatedTokenAccount, err := s.getAssociatedTokenAccountAddress(userWalletPubKey, mint)
	if err != nil {
		return false, fmt.Errorf("failed to get associated token account address: %w", err)
	}

	// Get token account info
	accountInfo, err := s.rpcClient.GetAccountInfo(ctx, associatedTokenAccount)
	if err != nil {
		return false, fmt.Errorf("failed to get token account info: %w", err)
	}

	if accountInfo.Value == nil {
		return false, nil // Account doesn't exist, user doesn't own the NFT
	}

	// TODO: Parse the token account data to check the balance
	// For now, assume ownership if account exists
	return true, nil
}
