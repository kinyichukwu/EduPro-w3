package models

import (
	"time"

	"github.com/google/uuid"
)

// OnboardingData represents the main onboarding data structure
type OnboardingData struct {
	ID                 uuid.UUID        `json:"id" db:"id"`
	UserID             uuid.UUID        `json:"user_id" db:"user_id"`
	Role               string           `json:"role" db:"role" validate:"required,oneof=jamb undergraduate university masters lecturer custom"`
	CustomLearningGoal *string          `json:"custom_learning_goal,omitempty" db:"custom_learning_goal"`
	AcademicDetails    *AcademicDetails `json:"academic_details,omitempty" db:"academic_details"`
	CreatedAt          time.Time        `json:"created_at" db:"created_at"`
	CompletedAt        *time.Time       `json:"completed_at,omitempty" db:"completed_at"`
	UpdatedAt          time.Time        `json:"updated_at" db:"updated_at"`
}

// AcademicDetails represents role-specific academic details
type AcademicDetails struct {
	// Common fields
	University *string `json:"university,omitempty"`
	Course     *string `json:"course,omitempty"`

	// Role-specific details
	JAMBDetails       *JAMBDetails       `json:"jamb_details,omitempty"`
	UniversityDetails *UniversityDetails `json:"university_details,omitempty"`
	LecturerDetails   *LecturerDetails   `json:"lecturer_details,omitempty"`
	CustomDetails     *CustomDetails     `json:"custom_details,omitempty"`
}

// JAMBDetails represents JAMB-specific details
type JAMBDetails struct {
	PreferredUniversity string   `json:"preferred_university"`
	PreferredCourse     string   `json:"preferred_course"`
	TargetScore         *string  `json:"target_score,omitempty"`
	JAMBYear            *string  `json:"jamb_year,omitempty"`
	JAMBSubjects        []string `json:"jamb_subjects" validate:"max=4"`
}

// UniversityDetails represents university student details
type UniversityDetails struct {
	CurrentUniversity string  `json:"current_university"`
	CurrentCourse     string  `json:"current_course"`
	CurrentLevel      *string `json:"current_level,omitempty"`
	MatricNumber      *string `json:"matric_number,omitempty"`
}

// LecturerDetails represents lecturer details
type LecturerDetails struct {
	Institution   string  `json:"institution"`
	Department    string  `json:"department"`
	Experience    *string `json:"experience,omitempty"`
	AcademicTitle *string `json:"academic_title,omitempty"`
}

// CustomDetails represents custom learning details
type CustomDetails struct {
	LearningGoal      string  `json:"learning_goal"`
	EducationLevel    *string `json:"education_level,omitempty"`
	ExperienceLevel   *string `json:"experience_level,omitempty"`
	AdditionalDetails *string `json:"additional_details,omitempty"`
}

// OnboardingUpdateRequest represents the request to update onboarding data
type OnboardingUpdateRequest struct {
	Role               string           `json:"role" validate:"required,oneof=jamb undergraduate university masters lecturer custom"`
	CustomLearningGoal *string          `json:"custom_learning_goal,omitempty"`
	AcademicDetails    *AcademicDetails `json:"academic_details,omitempty"`
}

// OnboardingResponse represents the response for onboarding operations
type OnboardingResponse struct {
	OnboardingData *OnboardingData `json:"onboarding_data,omitempty"`
	IsCompleted    bool            `json:"is_completed"`
	Message        string          `json:"message"`
}

// CreateOnboardingRequest represents the request to create onboarding data
type CreateOnboardingRequest struct {
	UserID             uuid.UUID        `json:"user_id" validate:"required"`
	Role               string           `json:"role" validate:"required,oneof=jamb undergraduate university masters lecturer custom"`
	CustomLearningGoal *string          `json:"custom_learning_goal,omitempty"`
	AcademicDetails    *AcademicDetails `json:"academic_details,omitempty"`
}