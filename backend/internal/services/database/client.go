package database

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Client represents the database client
type Client struct {
	db *sql.DB
}

// NewClient creates a new database client
func NewClient(cfg *config.Config) (*Client, error) {
	logger := utils.GetLogger()

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		logger.Error("Failed to connect to database", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		logger.Error("Failed to ping database", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Database connection established successfully")
	return &Client{db: db}, nil
}

// Close closes the database connection
func (c *Client) Close() error {
	return c.db.Close()
}

// GetDB returns the underlying database connection
func (c *Client) GetDB() *sql.DB {
	return c.db
}

// CreateUser creates a new user in the database
func (c *Client) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	logger := utils.GetLogger()
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

	err := c.db.QueryRow(query, user.ID, user.Email, user.Username, user.FullName, user.SupabaseID).
		Scan(&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create user", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	logger.Info("User created successfully", zap.String("user_id", user.ID.String()))
	return user, nil
}

// GetUserBySupabaseID retrieves a user by their Supabase ID
func (c *Client) GetUserBySupabaseID(supabaseID string) (*models.User, error) {
	logger := utils.GetLogger()

	user := &models.User{}
	query := `
		SELECT id, email, username, full_name, avatar, supabase_id, created_at, updated_at
		FROM users
		WHERE supabase_id = $1
	`

	err := c.db.QueryRow(query, supabaseID).Scan(
		&user.ID, &user.Email, &user.Username, &user.FullName,
		&user.Avatar, &user.SupabaseID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
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

	user := &models.User{}
	query := `
		SELECT id, email, username, full_name, avatar, supabase_id, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err := c.db.QueryRow(query, userID).Scan(
		&user.ID, &user.Email, &user.Username, &user.FullName,
		&user.Avatar, &user.SupabaseID, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
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
	err := c.db.QueryRow(query, userID, req.Username, req.FullName, req.Avatar).Scan(
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

	err := c.db.QueryRow(query, onboarding.ID, onboarding.UserID, onboarding.Role,
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

	err = c.db.QueryRow(query, internalUserID).Scan(
		&onboarding.ID, &onboarding.UserID, &onboarding.Role,
		&onboarding.CustomLearningGoal, &academicDetailsJSON,
		&onboarding.CreatedAt, &onboarding.CompletedAt, &onboarding.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
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

	err = c.db.QueryRow(query, internalUserID, req.Role, req.CustomLearningGoal, academicDetailsJSON).Scan(
		&onboarding.ID, &onboarding.UserID, &onboarding.Role,
		&onboarding.CustomLearningGoal, &academicDetailsResult,
		&onboarding.CreatedAt, &onboarding.CompletedAt, &onboarding.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
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

	err := c.db.QueryRow(query, wallet.ID, wallet.UserID, wallet.WalletAddress, wallet.IsPrimary, wallet.IsVerified).
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

	query := `
		SELECT id, user_id, wallet_address, is_primary, is_verified, verified_at, created_at, updated_at
		FROM user_wallets
		WHERE user_id = $1
		ORDER BY is_primary DESC, created_at DESC
	`

	rows, err := c.db.Query(query, userID)
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

	wallet := &models.UserWallet{}
	query := `
		SELECT id, user_id, wallet_address, is_primary, is_verified, verified_at, created_at, updated_at
		FROM user_wallets
		WHERE id = $1
	`

	err := c.db.QueryRow(query, walletID).Scan(
		&wallet.ID, &wallet.UserID, &wallet.WalletAddress,
		&wallet.IsPrimary, &wallet.IsVerified, &wallet.VerifiedAt,
		&wallet.CreatedAt, &wallet.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
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

	query := `
		UPDATE user_wallets 
		SET is_verified = $2,
			verified_at = CASE WHEN $2 = TRUE THEN NOW() ELSE NULL END,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, user_id, wallet_address, is_primary, is_verified, verified_at, created_at, updated_at
	`

	wallet := &models.UserWallet{}
	err := c.db.QueryRow(query, walletID, isVerified).Scan(
		&wallet.ID, &wallet.UserID, &wallet.WalletAddress,
		&wallet.IsPrimary, &wallet.IsVerified, &wallet.VerifiedAt,
		&wallet.CreatedAt, &wallet.UpdatedAt,
	)
	if err != nil {
		logger.Error("Failed to update wallet", zap.String("error", err.Error()))
		return nil, fmt.Errorf("failed to update wallet: %w", err)
	}

	logger.Info("Wallet updated successfully", zap.String("wallet_id", walletID.String()))
	return wallet, nil
}

// DeleteWallet removes a wallet
func (c *Client) DeleteWallet(walletID uuid.UUID, userID uuid.UUID) error {
	logger := utils.GetLogger()

	query := `
		DELETE FROM user_wallets 
		WHERE id = $1 AND user_id = $2
	`

	result, err := c.db.Exec(query, walletID, userID)
	if err != nil {
		logger.Error("Failed to delete wallet", zap.String("error", err.Error()))
		return fmt.Errorf("failed to delete wallet: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		logger.Error("Failed to get rows affected", zap.String("error", err.Error()))
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		logger.Warn("No wallet found to delete", zap.String("wallet_id", walletID.String()))
		return fmt.Errorf("wallet not found or not owned by user")
	}

	logger.Info("Wallet deleted successfully", zap.String("wallet_id", walletID.String()))
	return nil
}
