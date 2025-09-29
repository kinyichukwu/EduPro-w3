package database

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// Client represents the database client
type Client struct {
	pool *pgxpool.Pool
}

// NewClient creates a new database client
func NewClient(cfg *config.Config) (*Client, error) {
	logger := utils.GetLogger()

	// Parse connection config
	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		logger.Error("Failed to parse database URL", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Configure connection pool similar to your working setup
	poolConfig.MaxConns = 10
	poolConfig.MinConns = 2
	poolConfig.MaxConnLifetime = time.Minute * 5
	poolConfig.MaxConnIdleTime = time.Minute * 1

	// Disable prepared statement caching to avoid conflicts
	poolConfig.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeExec
	// Create connection pool
	ctx := context.Background()
	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		logger.Error("Failed to create connection pool", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Validate the connection
	if err := pool.Ping(ctx); err != nil {
		logger.Error("Failed to ping database", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Database connection pool established successfully")
	return &Client{pool: pool}, nil
}

// Close closes the database connection pool
func (c *Client) Close() {
	c.pool.Close()
}

// GetPool returns the underlying connection pool
func (c *Client) GetPool() *pgxpool.Pool {
	return c.pool
}

// CreateUser creates a new user in the database
func (c *Client) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	// TODO: what is the difference between the username and the full name?
	user := &models.User{
		ID:         uuid.New(),
		Email:      req.Email,
		Username:   req.Username,
		FullName:   req.FullName,
		SupabaseID: req.SupabaseID,
	}

	query := `
		INSERT INTO users (id, email, username, full_name, supabase_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING created_at, updated_at
	`

	err := c.pool.QueryRow(ctx, query, user.ID, user.Email, user.Username, user.FullName, user.SupabaseID).
		Scan(&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create user", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	logger.Info("User created successfully", zap.String("user_id", user.ID.String()))
	return user, nil
}

// GetUserByEmail retrieves a user by their email address
func (c *Client) GetUserByEmail(email string) (*models.User, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	user := &models.User{}
	query := `
		SELECT id, email, username, full_name, avatar, membership_nft_address, supabase_id, created_at, updated_at
		FROM users 
		WHERE email = $1
	`

	err := c.pool.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Email, &user.Username, &user.FullName, &user.Avatar,
		&user.MembershipNFTAddress, &user.SupabaseID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil // User not found
		}
		logger.Error("Failed to get user by email", zap.String("email", email), zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

// UpdateUserMembershipNFT updates the user's membership NFT address
func (c *Client) UpdateUserMembershipNFT(userID uuid.UUID, nftAddress string) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		UPDATE users 
		SET membership_nft_address = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := c.pool.Exec(ctx, query, nftAddress, userID)
	if err != nil {
		logger.Error("Failed to update user membership NFT",
			zap.String("user_id", userID.String()),
			zap.String("nft_address", nftAddress),
			zap.String("error", err.Error()))
		return fmt.Errorf("failed to update user membership NFT: %w", err)
	}

	logger.Info("User membership NFT updated successfully",
		zap.String("user_id", userID.String()),
		zap.String("nft_address", nftAddress))
	return nil
}

// GetUserBySupabaseID retrieves a user by their Supabase ID
func (c *Client) GetUserBySupabaseID(supabaseID string) (*models.User, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	user := &models.User{}
	query := `
		SELECT id, email, username, full_name, avatar, supabase_id, created_at, updated_at
		FROM users
		WHERE supabase_id = $1
	`

	// Log the query being executed for debugging
	logger.Debug("Executing get user by supabase ID query",
		zap.String("query", query),
		zap.String("supabase_id", supabaseID))

	// Validate database connection before executing query
	if err := c.pool.Ping(ctx); err != nil {
		logger.Error("Database connection lost for user query", zap.String("error", err.Error()))
		return nil, fmt.Errorf("database connection error: %w", err)
	}

	// Use pgx QueryRow - no more prepared statement issues
	err := c.pool.QueryRow(ctx, query, supabaseID).Scan(
		&user.ID, &user.Email, &user.Username, &user.FullName,
		&user.Avatar, &user.SupabaseID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Warn("User not found", zap.String("supabase_id", supabaseID))
			return nil, fmt.Errorf("user not found")
		}
		logger.Error("Failed to get user", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// GetUserByID retrieves a user by their ID
func (c *Client) GetUserByID(userID uuid.UUID) (*models.User, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	user := &models.User{}
	query := `
		SELECT id, email, username, full_name, avatar, supabase_id, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err := c.pool.QueryRow(ctx, query, userID).Scan(
		&user.ID, &user.Email, &user.Username, &user.FullName,
		&user.Avatar, &user.SupabaseID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Warn("User not found", zap.String("user_id", userID.String()))
			return nil, fmt.Errorf("user not found")
		}
		logger.Error("Failed to get user", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// UpdateUser updates a user's information
func (c *Client) UpdateUser(userID uuid.UUID, req *models.UpdateUserRequest) (*models.User, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		UPDATE users 
		SET username = COALESCE($2, username),
			full_name = COALESCE($3, full_name),
			avatar = COALESCE($4, avatar),
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, email, username, full_name, avatar, supabase_id, created_at, updated_at
	`

	user := &models.User{}
	err := c.pool.QueryRow(ctx, query, userID, req.Username, req.FullName, req.Avatar).Scan(
		&user.ID, &user.Email, &user.Username, &user.FullName,
		&user.Avatar, &user.SupabaseID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		logger.Error("Failed to update user", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	logger.Info("User updated successfully", zap.String("user_id", userID.String()))
	return user, nil
}

// CreateOnboarding creates onboarding data for a user
func (c *Client) CreateOnboarding(req *models.CreateOnboardingRequest) (*models.OnboardingData, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	// Handle academic details JSON
	var academicDetailsJSON *string
	if len(req.AcademicDetails) > 0 {
		jsonStr := string(req.AcademicDetails)
		academicDetailsJSON = &jsonStr
	}

	onboarding := &models.OnboardingData{
		ID:                 uuid.New(),
		UserID:             req.UserID,
		Role:               req.Role,
		CustomLearningGoal: req.CustomLearningGoal,
		AcademicDetails:    req.AcademicDetails,
	}

	query := `
		INSERT INTO onboarding (id, user_id, role, custom_learning_goal, academic_details, created_at, completed_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
		RETURNING created_at, completed_at, updated_at
	`

	err := c.pool.QueryRow(ctx, query, onboarding.ID, onboarding.UserID, onboarding.Role,
		onboarding.CustomLearningGoal, academicDetailsJSON).
		Scan(&onboarding.CreatedAt, &onboarding.CompletedAt, &onboarding.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create onboarding", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create onboarding: %w", err)
	}

	logger.Info("Onboarding created successfully", zap.String("onboarding_id", onboarding.ID.String()))
	return onboarding, nil
}

// GetOnboardingByUserID retrieves onboarding data for a user (userID can be Supabase ID)
func (c *Client) GetOnboardingByUserID(userID uuid.UUID) (*models.OnboardingData, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	// First, get the internal user ID from Supabase ID
	user, err := c.GetUserBySupabaseID(userID.String())
	if err != nil {
		logger.Warn("User not found by Supabase ID for onboarding lookup", zap.String("supabase_id", userID.String()))
		return nil, fmt.Errorf("user not found")
	}

	internalUserID := user.ID

	onboarding := &models.OnboardingData{}
	var academicDetailsJSON *string

	query := `
		SELECT id, user_id, role, custom_learning_goal, academic_details, created_at, completed_at, updated_at
		FROM onboarding
		WHERE user_id = $1
	`

	// Log the query being executed for debugging
	logger.Debug("Executing get onboarding query",
		zap.String("query", query),
		zap.String("internal_user_id", internalUserID.String()))

	// Validate database connection before executing query
	if err := c.pool.Ping(ctx); err != nil {
		logger.Error("Database connection lost for onboarding query", zap.String("error", err.Error()))
		return nil, fmt.Errorf("database connection error: %w", err)
	}

	// Use pgx QueryRow - no more prepared statement issues
	err = c.pool.QueryRow(ctx, query, internalUserID).Scan(
		&onboarding.ID, &onboarding.UserID, &onboarding.Role,
		&onboarding.CustomLearningGoal, &academicDetailsJSON,
		&onboarding.CreatedAt, &onboarding.CompletedAt, &onboarding.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Warn("Onboarding not found", zap.String("internal_user_id", internalUserID.String()))
			return nil, fmt.Errorf("onboarding not found")
		}
		logger.Error("Failed to get onboarding", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get onboarding: %w", err)
	}

	// Set academic details as raw JSON
	if academicDetailsJSON != nil {
		onboarding.AcademicDetails = json.RawMessage(*academicDetailsJSON)
	}

	return onboarding, nil
}

// UpdateOnboarding updates onboarding data for a user (userID can be Supabase ID)
func (c *Client) UpdateOnboarding(userID uuid.UUID, req *models.OnboardingUpdateRequest) (*models.OnboardingData, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	// First, get the internal user ID from Supabase ID
	user, err := c.GetUserBySupabaseID(userID.String())
	if err != nil {
		logger.Error("User not found by Supabase ID", zap.String("supabase_id", userID.String()), zap.String("error", err.Error()))
		return nil, fmt.Errorf("user not found: %w", err)
	}

	internalUserID := user.ID
	logger.Info("Found user for onboarding update",
		zap.String("supabase_id", userID.String()),
		zap.String("internal_user_id", internalUserID.String()),
	)

	// Handle academic details JSON
	var academicDetailsJSON *string
	if len(req.AcademicDetails) > 0 {
		jsonStr := string(req.AcademicDetails)
		academicDetailsJSON = &jsonStr
	}

	// First, try to update existing onboarding using internal user ID
	query := `
		UPDATE onboarding 
		SET role = $2,
			custom_learning_goal = $3,
			academic_details = $4,
			completed_at = NOW(),
			updated_at = NOW()
		WHERE user_id = $1
		RETURNING id, user_id, role, custom_learning_goal, academic_details, created_at, completed_at, updated_at
	`

	onboarding := &models.OnboardingData{}
	var academicDetailsResult *string

	err = c.pool.QueryRow(ctx, query, internalUserID, req.Role, req.CustomLearningGoal, academicDetailsJSON).Scan(
		&onboarding.ID, &onboarding.UserID, &onboarding.Role,
		&onboarding.CustomLearningGoal, &academicDetailsResult,
		&onboarding.CreatedAt, &onboarding.CompletedAt, &onboarding.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			// If no existing onboarding, create a new one using internal user ID
			createReq := &models.CreateOnboardingRequest{
				UserID:             internalUserID,
				Role:               req.Role,
				CustomLearningGoal: req.CustomLearningGoal,
				AcademicDetails:    req.AcademicDetails,
			}
			return c.CreateOnboarding(createReq)
		}
		logger.Error("Failed to update onboarding", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update onboarding: %w", err)
	}

	// Set academic details as raw JSON
	if academicDetailsResult != nil {
		onboarding.AcademicDetails = json.RawMessage(*academicDetailsResult)
	}

	logger.Info("Onboarding updated successfully", zap.String("user_id", userID.String()))
	return onboarding, nil
}

// =====================================================
// WALLET METHODS
// =====================================================

// CreateWallet creates a new wallet for a user
func (c *Client) CreateWallet(userID uuid.UUID, address string, isPrimary bool) (*models.UserWallet, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	wallet := &models.UserWallet{
		ID:            uuid.New(),
		UserID:        userID,
		WalletAddress: address,
		IsPrimary:     isPrimary,
		IsVerified:    false,
	}

	query := `
		INSERT INTO user_wallets (id, user_id, wallet_address, is_primary, is_verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING created_at, updated_at
	`

	err := c.pool.QueryRow(ctx, query, wallet.ID, wallet.UserID, wallet.WalletAddress, wallet.IsPrimary, wallet.IsVerified).
		Scan(&wallet.CreatedAt, &wallet.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create wallet", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create wallet: %w", err)
	}

	logger.Info("Wallet created successfully", zap.String("wallet_id", wallet.ID.String()))
	return wallet, nil
}

// GetWalletsByUserID retrieves all wallets for a user
func (c *Client) GetWalletsByUserID(userID uuid.UUID) ([]*models.UserWallet, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT id, user_id, wallet_address, is_primary, is_verified, verified_at, created_at, updated_at
		FROM user_wallets
		WHERE user_id = $1
		ORDER BY is_primary DESC, created_at DESC
	`

	rows, err := c.pool.Query(ctx, query, userID)
	if err != nil {
		logger.Error("Failed to get wallets", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get wallets: %w", err)
	}
	defer rows.Close()

	var wallets []*models.UserWallet
	for rows.Next() {
		wallet := &models.UserWallet{}
		err := rows.Scan(
			&wallet.ID, &wallet.UserID, &wallet.WalletAddress,
			&wallet.IsPrimary, &wallet.IsVerified, &wallet.VerifiedAt,
			&wallet.CreatedAt, &wallet.UpdatedAt,
		)
		if err != nil {
			logger.Error("Failed to scan wallet", zap.String("error", err.Error()))
			return nil, fmt.Errorf("failed to scan wallet: %w", err)
		}
		wallets = append(wallets, wallet)
	}

	if err := rows.Err(); err != nil {
		logger.Error("Failed to iterate wallets", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to iterate wallets: %w", err)
	}

	return wallets, nil
}

// GetWalletByID retrieves a wallet by its ID
func (c *Client) GetWalletByID(walletID uuid.UUID) (*models.UserWallet, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	wallet := &models.UserWallet{}
	query := `
		SELECT id, user_id, wallet_address, is_primary, is_verified, verified_at, created_at, updated_at
		FROM user_wallets
		WHERE id = $1
	`

	err := c.pool.QueryRow(ctx, query, walletID).Scan(
		&wallet.ID, &wallet.UserID, &wallet.WalletAddress,
		&wallet.IsPrimary, &wallet.IsVerified, &wallet.VerifiedAt,
		&wallet.CreatedAt, &wallet.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Warn("Wallet not found", zap.String("wallet_id", walletID.String()))
			return nil, fmt.Errorf("wallet not found")
		}
		logger.Error("Failed to get wallet", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to get wallet: %w", err)
	}

	return wallet, nil
}

// UpdateWallet updates a wallet's verification status
func (c *Client) UpdateWallet(walletID uuid.UUID, isVerified bool) (*models.UserWallet, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		UPDATE user_wallets 
		SET is_verified = $2,
			verified_at = CASE WHEN $2 = TRUE THEN NOW() ELSE NULL END,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, user_id, wallet_address, is_primary, is_verified, verified_at, created_at, updated_at
	`

	wallet := &models.UserWallet{}
	err := c.pool.QueryRow(ctx, query, walletID, isVerified).Scan(
		&wallet.ID, &wallet.UserID, &wallet.WalletAddress,
		&wallet.IsPrimary, &wallet.IsVerified, &wallet.VerifiedAt,
		&wallet.CreatedAt, &wallet.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Warn("Wallet not found for update", zap.String("wallet_id", walletID.String()))
			return nil, fmt.Errorf("wallet not found")
		}
		logger.Error("Failed to update wallet", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update wallet: %w", err)
	}

	logger.Info("Wallet updated successfully", zap.String("wallet_id", walletID.String()))
	return wallet, nil
}

// DeleteWallet removes a wallet
func (c *Client) DeleteWallet(walletID uuid.UUID, userID uuid.UUID) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		DELETE FROM user_wallets 
		WHERE id = $1 AND user_id = $2
	`

	result, err := c.pool.Exec(ctx, query, walletID, userID)
	if err != nil {
		logger.Error("Failed to delete wallet", zap.String("error", err.Error()))
		return fmt.Errorf("failed to delete wallet: %w", err)
	}

	rowsAffected := result.RowsAffected()

	if rowsAffected == 0 {
		logger.Warn("No wallet found to delete", zap.String("wallet_id", walletID.String()))
		return fmt.Errorf("wallet not found or not owned by user")
	}

	logger.Info("Wallet deleted successfully", zap.String("wallet_id", walletID.String()))
	return nil
}

// NFT Database Methods

// CreateMembershipNFT creates a new membership NFT record
func (c *Client) CreateMembershipNFT(nft *models.MembershipNFT) error {
	query := `
		INSERT INTO membership_nfts (
			id, user_id, user_email, wallet_address, nft_mint_address, 
			nft_metadata_uri, transaction_signature, status, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)`

	_, err := c.pool.Exec(context.Background(), query,
		nft.ID, nft.UserID, nft.UserEmail, nft.WalletAddress, nft.NFTMintAddress,
		nft.NFTMetadataURI, nft.TransactionSignature, nft.Status, nft.CreatedAt, nft.UpdatedAt,
	)

	return err
}

// GetMembershipNFTByEmail retrieves a membership NFT by user email
func (c *Client) GetMembershipNFTByEmail(userEmail string) (*models.MembershipNFT, error) {
	query := `
		SELECT id, user_id, user_email, wallet_address, nft_mint_address, 
			   nft_metadata_uri, transaction_signature, status, created_at, minted_at, updated_at
		FROM membership_nfts 
		WHERE user_email = $1`

	var nft models.MembershipNFT
	err := c.pool.QueryRow(context.Background(), query, userEmail).Scan(
		&nft.ID, &nft.UserID, &nft.UserEmail, &nft.WalletAddress, &nft.NFTMintAddress,
		&nft.NFTMetadataURI, &nft.TransactionSignature, &nft.Status, &nft.CreatedAt, &nft.MintedAt, &nft.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &nft, nil
}

// CreateCourseNFTCollection creates a new course NFT collection record
func (c *Client) CreateCourseNFTCollection(collection *models.CourseNFTCollection) error {
	query := `
		INSERT INTO course_nft_collections (
			id, creator_id, creator_email, course_id, course_title, collection_mint_address,
			collection_metadata_uri, max_supply, current_supply, price_edutoken, is_active,
			transaction_signature, status, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		)`

	_, err := c.pool.Exec(context.Background(), query,
		collection.ID, collection.CreatorID, collection.CreatorEmail, collection.CourseID, collection.CourseTitle,
		collection.CollectionMintAddress, collection.CollectionMetadataURI, collection.MaxSupply, collection.CurrentSupply,
		collection.PriceEduProTokens, collection.IsActive, collection.TransactionSignature, collection.Status,
		collection.CreatedAt, collection.UpdatedAt,
	)

	return err
}

// GetCourseNFTCollectionByID retrieves a course NFT collection by ID
func (c *Client) GetCourseNFTCollectionByID(collectionID uuid.UUID) (*models.CourseNFTCollection, error) {
	query := `
		SELECT id, creator_id, creator_email, course_id, course_title, collection_mint_address,
			   collection_metadata_uri, max_supply, current_supply, price_edutoken, is_active,
			   transaction_signature, status, created_at, minted_at, updated_at
		FROM course_nft_collections 
		WHERE id = $1`

	var collection models.CourseNFTCollection
	err := c.pool.QueryRow(context.Background(), query, collectionID).Scan(
		&collection.ID, &collection.CreatorID, &collection.CreatorEmail, &collection.CourseID, &collection.CourseTitle,
		&collection.CollectionMintAddress, &collection.CollectionMetadataURI, &collection.MaxSupply, &collection.CurrentSupply,
		&collection.PriceEduProTokens, &collection.IsActive, &collection.TransactionSignature, &collection.Status,
		&collection.CreatedAt, &collection.MintedAt, &collection.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &collection, nil
}

// GetCourseNFTCollectionByCourseID retrieves a course NFT collection by course ID
func (c *Client) GetCourseNFTCollectionByCourseID(courseID uuid.UUID) (*models.CourseNFTCollection, error) {
	query := `
		SELECT id, creator_id, creator_email, course_id, course_title, collection_mint_address,
			   collection_metadata_uri, max_supply, current_supply, price_edutoken, is_active,
			   transaction_signature, status, created_at, minted_at, updated_at
		FROM course_nft_collections 
		WHERE course_id = $1`

	var collection models.CourseNFTCollection
	err := c.pool.QueryRow(context.Background(), query, courseID).Scan(
		&collection.ID, &collection.CreatorID, &collection.CreatorEmail, &collection.CourseID, &collection.CourseTitle,
		&collection.CollectionMintAddress, &collection.CollectionMetadataURI, &collection.MaxSupply, &collection.CurrentSupply,
		&collection.PriceEduProTokens, &collection.IsActive, &collection.TransactionSignature, &collection.Status,
		&collection.CreatedAt, &collection.MintedAt, &collection.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &collection, nil
}

// CreateCourseNFT creates a new course NFT record
func (c *Client) CreateCourseNFT(nft *models.CourseNFT) error {
	query := `
		INSERT INTO course_nfts (
			id, collection_id, owner_id, owner_email, owner_wallet_address, nft_mint_address,
			nft_metadata_uri, token_id, transaction_signature, status, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		)`

	_, err := c.pool.Exec(context.Background(), query,
		nft.ID, nft.CollectionID, nft.OwnerID, nft.OwnerEmail, nft.OwnerWalletAddress, nft.NFTMintAddress,
		nft.NFTMetadataURI, nft.TokenID, nft.TransactionSignature, nft.Status, nft.CreatedAt, nft.UpdatedAt,
	)

	return err
}

// GetCourseNFTsByOwnerEmail retrieves course NFTs owned by a user email
func (c *Client) GetCourseNFTsByOwnerEmail(ownerEmail string) ([]models.CourseNFT, error) {
	query := `
		SELECT id, collection_id, owner_id, owner_email, owner_wallet_address, nft_mint_address,
			   nft_metadata_uri, token_id, transaction_signature, status, created_at, minted_at, transferred_at, updated_at
		FROM course_nfts 
		WHERE owner_email = $1 AND status != 'burned'
		ORDER BY created_at DESC`

	rows, err := c.pool.Query(context.Background(), query, ownerEmail)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nfts []models.CourseNFT
	for rows.Next() {
		var nft models.CourseNFT
		err := rows.Scan(
			&nft.ID, &nft.CollectionID, &nft.OwnerID, &nft.OwnerEmail, &nft.OwnerWalletAddress, &nft.NFTMintAddress,
			&nft.NFTMetadataURI, &nft.TokenID, &nft.TransactionSignature, &nft.Status, &nft.CreatedAt, &nft.MintedAt, &nft.TransferredAt, &nft.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		nfts = append(nfts, nft)
	}

	return nfts, nil
}

// GetCourseNFTsByCollectionID retrieves all course NFTs in a collection
func (c *Client) GetCourseNFTsByCollectionID(collectionID uuid.UUID) ([]models.CourseNFT, error) {
	query := `
		SELECT id, collection_id, owner_id, owner_email, owner_wallet_address, nft_mint_address,
			   nft_metadata_uri, token_id, transaction_signature, status, created_at, minted_at, transferred_at, updated_at
		FROM course_nfts 
		WHERE collection_id = $1 AND status != 'burned'
		ORDER BY token_id ASC`

	rows, err := c.pool.Query(context.Background(), query, collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nfts []models.CourseNFT
	for rows.Next() {
		var nft models.CourseNFT
		err := rows.Scan(
			&nft.ID, &nft.CollectionID, &nft.OwnerID, &nft.OwnerEmail, &nft.OwnerWalletAddress, &nft.NFTMintAddress,
			&nft.NFTMetadataURI, &nft.TokenID, &nft.TransactionSignature, &nft.Status, &nft.CreatedAt, &nft.MintedAt, &nft.TransferredAt, &nft.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		nfts = append(nfts, nft)
	}

	return nfts, nil
}

// GetAvailableCourseNFTsByCollectionID retrieves available (unowned) course NFTs in a collection
func (c *Client) GetAvailableCourseNFTsByCollectionID(collectionID uuid.UUID) ([]models.CourseNFT, error) {
	query := `
		SELECT id, collection_id, owner_id, owner_email, owner_wallet_address, nft_mint_address,
			   nft_metadata_uri, token_id, transaction_signature, status, created_at, minted_at, transferred_at, updated_at
		FROM course_nfts 
		WHERE collection_id = $1 AND owner_id IS NULL AND status = 'minted'
		ORDER BY token_id ASC`

	rows, err := c.pool.Query(context.Background(), query, collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nfts []models.CourseNFT
	for rows.Next() {
		var nft models.CourseNFT
		err := rows.Scan(
			&nft.ID, &nft.CollectionID, &nft.OwnerID, &nft.OwnerEmail, &nft.OwnerWalletAddress, &nft.NFTMintAddress,
			&nft.NFTMetadataURI, &nft.TokenID, &nft.TransactionSignature, &nft.Status, &nft.CreatedAt, &nft.MintedAt, &nft.TransferredAt, &nft.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		nfts = append(nfts, nft)
	}

	return nfts, nil
}

// GetCourseNFTByCollectionAndOwner retrieves a course NFT by collection and owner
func (c *Client) GetCourseNFTByCollectionAndOwner(collectionID uuid.UUID, ownerEmail string) (*models.CourseNFT, error) {
	query := `
		SELECT id, collection_id, owner_id, owner_email, owner_wallet_address, nft_mint_address,
			   nft_metadata_uri, token_id, transaction_signature, status, created_at, minted_at, transferred_at, updated_at
		FROM course_nfts 
		WHERE collection_id = $1 AND owner_email = $2 AND status != 'burned'`

	var nft models.CourseNFT
	err := c.pool.QueryRow(context.Background(), query, collectionID, ownerEmail).Scan(
		&nft.ID, &nft.CollectionID, &nft.OwnerID, &nft.OwnerEmail, &nft.OwnerWalletAddress, &nft.NFTMintAddress,
		&nft.NFTMetadataURI, &nft.TokenID, &nft.TransactionSignature, &nft.Status, &nft.CreatedAt, &nft.MintedAt, &nft.TransferredAt, &nft.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &nft, nil
}

// UpdateCourseNFTCollectionSupply updates the current supply of a course NFT collection
func (c *Client) UpdateCourseNFTCollectionSupply(collectionID uuid.UUID, newSupply int) error {
	query := `
		UPDATE course_nft_collections 
		SET current_supply = $1, updated_at = NOW()
		WHERE id = $2`

	_, err := c.pool.Exec(context.Background(), query, newSupply, collectionID)
	return err
}

// IncrementCourseNFTCollectionSupply atomically increments the collection supply and returns the new token ID
func (c *Client) IncrementCourseNFTCollectionSupply(collectionID uuid.UUID) (int, error) {
	// Choose the next available token id atomically, even if current_supply is out-of-sync
	// with existing NFTs. This prevents duplicate (collection_id, token_id) pairs.
	query := `
        WITH next_ids AS (
            SELECT COALESCE(MAX(token_id), 0) + 1 AS max_token_id_plus_one
            FROM course_nfts
            WHERE collection_id = $1
        )
        UPDATE course_nft_collections c
        SET current_supply = LEAST(
                c.max_supply,
                GREATEST(c.current_supply + 1, (SELECT max_token_id_plus_one FROM next_ids))
            ),
            updated_at = NOW()
        WHERE c.id = $1 AND c.current_supply < c.max_supply
        RETURNING c.current_supply`

	var newTokenID int
	err := c.pool.QueryRow(context.Background(), query, collectionID).Scan(&newTokenID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return 0, fmt.Errorf("collection is sold out or does not exist")
		}
		return 0, err
	}

	return newTokenID, nil
}

// UpdateCourseNFTOwner updates the owner of a course NFT
func (c *Client) UpdateCourseNFTOwner(nftID uuid.UUID, ownerID *uuid.UUID, ownerEmail *string, ownerWalletAddress *string) error {
	query := `
		UPDATE course_nfts 
		SET owner_id = $1, owner_email = $2, owner_wallet_address = $3, 
			status = 'minted', minted_at = NOW(), updated_at = NOW()
		WHERE id = $4`

	_, err := c.pool.Exec(context.Background(), query, ownerID, ownerEmail, ownerWalletAddress, nftID)
	return err
}
