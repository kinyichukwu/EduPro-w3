package models

import (
	"time"

	"github.com/google/uuid"
)

// Course represents a course in the system
type Course struct {
	ID                    uuid.UUID `json:"id" db:"id"`
	UserID                uuid.UUID `json:"user_id" db:"user_id"`
	Title                 string    `json:"title" db:"title" validate:"required,min=3,max=255"`
	Description           string    `json:"description" db:"description"`
	Status                string    `json:"status" db:"status" validate:"oneof=draft published archived"`
	TotalModules          int       `json:"total_modules" db:"total_modules"`
	CompletedModules      int       `json:"completed_modules" db:"completed_modules"`
	StudentsCount         int       `json:"students_count" db:"students_count"`
	Earnings              float64   `json:"earnings" db:"earnings"`
	Price                 float64   `json:"price" db:"price"`
	ThumbnailURL          *string   `json:"thumbnail_url" db:"thumbnail_url"`
	CollectionMintAddress *string   `json:"collection_mint_address,omitempty" db:"collection_mint_address"`

	// NFT and pricing fields
	PriceEduTokens      int64   `json:"price_edu_tokens" db:"price_edu_tokens"`
	PriceTokenMint      *string `json:"price_token_mint" db:"price_token_mint"`
	NFTMintAddress      *string `json:"nft_mint_address" db:"nft_mint_address"`
	PlatformFeeBPS      int     `json:"platform_fee_bps" db:"platform_fee_bps"`
	NFTMetadataURI      *string `json:"nft_metadata_uri" db:"nft_metadata_uri"`
	CreationTxSignature *string `json:"creation_tx_signature" db:"creation_tx_signature"`
	CreatorWallet       *string `json:"creator_wallet" db:"creator_wallet"`
	ViewOnChainURL      *string `json:"view_on_chain_url,omitempty"` // computed field

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// CourseModule represents a module within a course
type CourseModule struct {
	ID          uuid.UUID `json:"id" db:"id"`
	CourseID    uuid.UUID `json:"course_id" db:"course_id"`
	Title       string    `json:"title" db:"title" validate:"required,min=3,max=255"`
	Description string    `json:"description" db:"description"`
	Content     string    `json:"content" db:"content"`
	OrderIndex  int       `json:"order_index" db:"order_index" validate:"min=1"`
	Status      string    `json:"status" db:"status" validate:"oneof=draft completed"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// ModuleLink represents a link/resource associated with a module
type ModuleLink struct {
	ID          uuid.UUID `json:"id" db:"id"`
	ModuleID    uuid.UUID `json:"module_id" db:"module_id"`
	URL         string    `json:"url" db:"url" validate:"required,url"`
	Title       *string   `json:"title" db:"title"`
	Description *string   `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// CourseEnrollment represents a user's enrollment in a course
type CourseEnrollment struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	CourseID       uuid.UUID  `json:"course_id" db:"course_id"`
	UserID         uuid.UUID  `json:"user_id" db:"user_id"`
	PurchaseID     *uuid.UUID `json:"purchase_id" db:"purchase_id"`
	EnrollmentType string     `json:"enrollment_type" db:"enrollment_type"` // free, purchased, gifted
	EnrolledAt     time.Time  `json:"enrolled_at" db:"enrolled_at"`
	CompletedAt    *time.Time `json:"completed_at" db:"completed_at"`
	Progress       float64    `json:"progress" db:"progress"`
}

// ModuleProgress represents a user's progress in a specific module
type ModuleProgress struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	UserID      uuid.UUID  `json:"user_id" db:"user_id"`
	ModuleID    uuid.UUID  `json:"module_id" db:"module_id"`
	Completed   bool       `json:"completed" db:"completed"`
	Progress    float64    `json:"progress" db:"progress"`
	StartedAt   *time.Time `json:"started_at" db:"started_at"`
	CompletedAt *time.Time `json:"completed_at" db:"completed_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// Request/Response models

// CreateCourseRequest represents the request to create a new course
type CreateCourseRequest struct {
	Title       string   `json:"title" validate:"required,min=3,max=255"`
	Description string   `json:"description" validate:"max=1000"`
	Price       *float64 `json:"price,omitempty" validate:"omitempty,min=0"`
}

// UpdateCourseRequest represents the request to update a course
type UpdateCourseRequest struct {
	Title        *string `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Description  *string `json:"description,omitempty" validate:"omitempty,max=1000"`
	Status       *string `json:"status,omitempty" validate:"omitempty,oneof=draft published archived"`
	ThumbnailURL *string `json:"thumbnail_url,omitempty" validate:"omitempty,url"`
}

// CreateModuleRequest represents the request to create a new module
type CreateModuleRequest struct {
	Title       string `json:"title" validate:"required,min=3,max=255"`
	Description string `json:"description" validate:"max=1000"`
	Content     string `json:"content"`
	OrderIndex  int    `json:"order_index" validate:"min=1"`
	UseAI       bool   `json:"use_ai"`
	AIPrompt    string `json:"ai_prompt"`
}

// UpdateModuleRequest represents the request to update a module
type UpdateModuleRequest struct {
	Title       *string `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=1000"`
	Content     *string `json:"content,omitempty"`
	OrderIndex  *int    `json:"order_index,omitempty" validate:"omitempty,min=1"`
	Status      *string `json:"status,omitempty" validate:"omitempty,oneof=draft completed"`
}

// AddModuleLinkRequest represents the request to add a link to a module
type AddModuleLinkRequest struct {
	URL         string  `json:"url" validate:"required,url"`
	Title       *string `json:"title,omitempty" validate:"omitempty,max=255"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
}

// CourseWithModules represents a course with its modules
type CourseWithModules struct {
	Course  Course         `json:"course"`
	Modules []CourseModule `json:"modules"`
}

// ModuleWithLinks represents a module with its links
type ModuleWithLinks struct {
	Module CourseModule `json:"module"`
	Links  []ModuleLink `json:"links"`
}

// CourseStats represents statistics for a course
type CourseStats struct {
	TotalCourses     int     `json:"total_courses"`
	PublishedCourses int     `json:"published_courses"`
	DraftCourses     int     `json:"draft_courses"`
	TotalStudents    int     `json:"total_students"`
	TotalEarnings    float64 `json:"total_earnings"`
}

// GenerateContentRequest represents the request to generate content with AI
type GenerateContentRequest struct {
	Prompt string `json:"prompt" validate:"required,min=10,max=1000"`
}

// GenerateContentResponse represents the response from content generation
type GenerateContentResponse struct {
	Content string `json:"content"`
}

// UpdateCourseStatusRequest represents the request to update course status
type UpdateCourseStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=draft published archived"`
}

// CourseProgressRequest represents the request to update course progress
type CourseProgressRequest struct {
	ModuleID  uuid.UUID `json:"module_id" validate:"required"`
	Completed bool      `json:"completed"`
	Progress  float64   `json:"progress" validate:"min=0,max=100"`
}

// CourseProgressResponse represents the user's progress in a course
type CourseProgressResponse struct {
	CourseID         uuid.UUID  `json:"course_id"`
	UserID           uuid.UUID  `json:"user_id"`
	Progress         float64    `json:"progress"`
	CompletedModules int        `json:"completed_modules"`
	TotalModules     int        `json:"total_modules"`
	EnrolledAt       time.Time  `json:"enrolled_at"`
	CompletedAt      *time.Time `json:"completed_at"`
}

// CourseLearningContent represents the learning content structure
type CourseLearningContent struct {
	Course         Course                  `json:"course"`
	Modules        []CourseModule          `json:"modules"`
	Progress       *CourseProgressResponse `json:"progress,omitempty"`
	ViewOnChainURL *string                 `json:"view_on_chain_url,omitempty"`
}

// CoursePurchase represents a course purchase transaction
type CoursePurchase struct {
	ID                  uuid.UUID  `json:"id" db:"id"`
	CourseID            uuid.UUID  `json:"course_id" db:"course_id"`
	BuyerUserID         uuid.UUID  `json:"buyer_user_id" db:"buyer_user_id"`
	BuyerWalletAddress  string     `json:"buyer_wallet_address" db:"buyer_wallet_address"`
	PurchaseTxSignature string     `json:"purchase_tx_signature" db:"purchase_tx_signature"`
	NFTMintAddress      string     `json:"nft_mint_address" db:"nft_mint_address"`
	TotalAmountPaid     int64      `json:"total_amount_paid" db:"total_amount_paid"`
	PlatformAmount      int64      `json:"platform_amount" db:"platform_amount"`
	SellerAmount        int64      `json:"seller_amount" db:"seller_amount"`
	PlatformFeeBPS      int        `json:"platform_fee_bps" db:"platform_fee_bps"`
	PurchaseStatus      string     `json:"purchase_status" db:"purchase_status"`
	NFTMintTxSignature  *string    `json:"nft_mint_tx_signature" db:"nft_mint_tx_signature"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
	ConfirmedAt         *time.Time `json:"confirmed_at" db:"confirmed_at"`
}

// CreateCourseWithPaymentRequest represents the request to create a course with payment
type CreateCourseWithPaymentRequest struct {
	Title               string `json:"title" validate:"required,min=3,max=255"`
	Description         string `json:"description" validate:"max=1000"`
	PriceEduTokens      int64  `json:"price_edu_tokens" validate:"min=0"`
	CreationTxSignature string `json:"creation_tx_signature" validate:"required"`
	CreatorWallet       string `json:"creator_wallet" validate:"required"`
}

// PurchaseCourseRequest represents the request to purchase a course
type PurchaseCourseRequest struct {
	PurchaseTxSignature string `json:"purchase_tx_signature" validate:"required"`
	BuyerWallet         string `json:"buyer_wallet" validate:"required"`
}

// CourseWithPurchaseInfo represents a course with purchase information
type CourseWithPurchaseInfo struct {
	Course          Course          `json:"course"`
	IsPurchased     bool            `json:"is_purchased"`
	Purchase        *CoursePurchase `json:"purchase,omitempty"`
	CanAccess       bool            `json:"can_access"`
	PriceDisplayEDU float64         `json:"price_display_edu"` // price in EDU tokens for display
}
