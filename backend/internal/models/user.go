package models

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system
type User struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	Email     string     `json:"email" db:"email"`
	Username  string     `json:"username" db:"username"`
	FullName  *string    `json:"full_name,omitempty" db:"full_name"`
	Avatar    *string    `json:"avatar,omitempty" db:"avatar"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
	// Supabase user ID for linking
	SupabaseID string `json:"supabase_id" db:"supabase_id"`
}

// UserProfile represents the user profile response
type UserProfile struct {
	ID             uuid.UUID       `json:"id"`
	Email          string          `json:"email"`
	Username       string          `json:"username"`
	FullName       *string         `json:"full_name,omitempty"`
	Avatar         *string         `json:"avatar,omitempty"`
	OnboardingData *OnboardingData `json:"onboarding_data,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// CreateUserRequest represents the request to create a new user
type CreateUserRequest struct {
	Email      string  `json:"email" validate:"required,email"`
	Username   string  `json:"username" validate:"required,min=3,max=50"`
	FullName   *string `json:"full_name,omitempty"`
	SupabaseID string  `json:"supabase_id" validate:"required"`
}

// UpdateUserRequest represents the request to update user profile
type UpdateUserRequest struct {
	Username *string `json:"username,omitempty" validate:"omitempty,min=3,max=50"`
	FullName *string `json:"full_name,omitempty"`
	Avatar   *string `json:"avatar,omitempty"`
}