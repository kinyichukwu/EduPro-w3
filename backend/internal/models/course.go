package models

import (
	"time"

	"github.com/google/uuid"
)

// Course represents a course in the system
type Course struct {
	ID               uuid.UUID `json:"id" db:"id"`
	UserID           uuid.UUID `json:"user_id" db:"user_id"`
	Title            string    `json:"title" db:"title" validate:"required,min=3,max=255"`
	Description      string    `json:"description" db:"description"`
	Status           string    `json:"status" db:"status" validate:"oneof=draft published archived"`
	TotalModules     int       `json:"total_modules" db:"total_modules"`
	CompletedModules int       `json:"completed_modules" db:"completed_modules"`
	StudentsCount    int       `json:"students_count" db:"students_count"`
	Earnings         float64   `json:"earnings" db:"earnings"`
	Price            float64   `json:"price" db:"price"`
	ThumbnailURL     *string   `json:"thumbnail_url" db:"thumbnail_url"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
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
	ID          uuid.UUID  `json:"id" db:"id"`
	CourseID    uuid.UUID  `json:"course_id" db:"course_id"`
	UserID      uuid.UUID  `json:"user_id" db:"user_id"`
	EnrolledAt  time.Time  `json:"enrolled_at" db:"enrolled_at"`
	CompletedAt *time.Time `json:"completed_at" db:"completed_at"`
	Progress    float64    `json:"progress" db:"progress"`
}

// Request/Response models

// CreateCourseRequest represents the request to create a new course
type CreateCourseRequest struct {
	Title       string `json:"title" validate:"required,min=3,max=255"`
	Description string `json:"description" validate:"max=1000"`
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
