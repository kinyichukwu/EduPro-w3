package database

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/google/uuid"
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
		logger.Error("Failed to connect to database", zap.Error(err))
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		logger.Error("Failed to ping database", zap.Error(err))
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Database connection established successfully")
	return &Client{db: db}, nil
}

// Close closes the database connection
func (c *Client) Close() error {
	return c.db.Close()
}

// CreateUser creates a new user in the database
func (c *Client) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	logger := utils.GetLogger()
	
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
		logger.Error("Failed to create user", zap.Error(err))
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
		logger.Error("Failed to get user", zap.Error(err))
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
		logger.Error("Failed to get user", zap.Error(err))
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
		logger.Error("Failed to update user", zap.Error(err))
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	logger.Info("User updated successfully", zap.String("user_id", userID.String()))
	return user, nil
}

// CreateOnboarding creates onboarding data for a user
func (c *Client) CreateOnboarding(req *models.CreateOnboardingRequest) (*models.OnboardingData, error) {
	logger := utils.GetLogger()
	
	// Serialize academic details to JSON
	var academicDetailsJSON *string
	if req.AcademicDetails != nil {
		jsonData, err := json.Marshal(req.AcademicDetails)
		if err != nil {
			logger.Error("Failed to marshal academic details", zap.Error(err))
			return nil, fmt.Errorf("failed to marshal academic details: %w", err)
		}
		jsonStr := string(jsonData)
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
		INSERT INTO onboarding (id, user_id, role, custom_learning_goal, academic_details, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING created_at, updated_at
	`

	err := c.db.QueryRow(query, onboarding.ID, onboarding.UserID, onboarding.Role, 
		onboarding.CustomLearningGoal, academicDetailsJSON).
		Scan(&onboarding.CreatedAt, &onboarding.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create onboarding", zap.Error(err))
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
		logger.Error("Failed to get onboarding", zap.Error(err))
		return nil, fmt.Errorf("failed to get onboarding: %w", err)
	}

	// Deserialize academic details from JSON
	if academicDetailsJSON != nil {
		var academicDetails models.AcademicDetails
		if err := json.Unmarshal([]byte(*academicDetailsJSON), &academicDetails); err != nil {
			logger.Error("Failed to unmarshal academic details", zap.Error(err))
			return nil, fmt.Errorf("failed to unmarshal academic details: %w", err)
		}
		onboarding.AcademicDetails = &academicDetails
	}

	return onboarding, nil
}

// UpdateOnboarding updates onboarding data for a user (userID can be Supabase ID)
func (c *Client) UpdateOnboarding(userID uuid.UUID, req *models.OnboardingUpdateRequest) (*models.OnboardingData, error) {
	logger := utils.GetLogger()
	
	// First, get the internal user ID from Supabase ID
	user, err := c.GetUserBySupabaseID(userID.String())
	if err != nil {
		logger.Error("User not found by Supabase ID", zap.String("supabase_id", userID.String()), zap.Error(err))
		return nil, fmt.Errorf("user not found: %w", err)
	}
	
	internalUserID := user.ID
	logger.Info("Found user for onboarding update", 
		zap.String("supabase_id", userID.String()),
		zap.String("internal_user_id", internalUserID.String()),
	)
	
	// Serialize academic details to JSON
	var academicDetailsJSON *string
	if req.AcademicDetails != nil {
		jsonData, err := json.Marshal(req.AcademicDetails)
		if err != nil {
			logger.Error("Failed to marshal academic details", zap.Error(err))
			return nil, fmt.Errorf("failed to marshal academic details: %w", err)
		}
		jsonStr := string(jsonData)
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
		logger.Error("Failed to update onboarding", zap.Error(err))
		return nil, fmt.Errorf("failed to update onboarding: %w", err)
	}

	// Deserialize academic details from JSON
	if academicDetailsResult != nil {
		var academicDetails models.AcademicDetails
		if err := json.Unmarshal([]byte(*academicDetailsResult), &academicDetails); err != nil {
			logger.Error("Failed to unmarshal academic details", zap.Error(err))
			return nil, fmt.Errorf("failed to unmarshal academic details: %w", err)
		}
		onboarding.AcademicDetails = &academicDetails
	}

	logger.Info("Onboarding updated successfully", zap.String("user_id", userID.String()))
	return onboarding, nil
}