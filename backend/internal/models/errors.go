package models

import (
	"fmt"
	"net/http"
)

// APIError represents a structured API error
type APIError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// Error implements the error interface
func (e *APIError) Error() string {
	return fmt.Sprintf("API Error %d: %s", e.Code, e.Message)
}

// Predefined API errors
var (
	ErrInvalidRequest = &APIError{
		Code:    http.StatusBadRequest,
		Message: "Invalid request format",
	}

	ErrInvalidTask = &APIError{
		Code:    http.StatusBadRequest,
		Message: "Invalid task type",
	}

	ErrQueryTooShort = &APIError{
		Code:    http.StatusBadRequest,
		Message: "Query is too short",
	}

	ErrQueryTooLong = &APIError{
		Code:    http.StatusBadRequest,
		Message: "Query is too long",
	}

	ErrAIServiceUnavailable = &APIError{
		Code:    http.StatusServiceUnavailable,
		Message: "AI service temporarily unavailable",
	}

	ErrRateLimitExceeded = &APIError{
		Code:    http.StatusTooManyRequests,
		Message: "Rate limit exceeded",
	}

	ErrInternalServer = &APIError{
		Code:    http.StatusInternalServerError,
		Message: "Internal server error",
	}

	ErrUnauthorized = &APIError{
		Code:    http.StatusUnauthorized,
		Message: "Unauthorized access",
	}
)

// NewAPIError creates a new API error with details
func NewAPIError(code int, message, details string) *APIError {
	return &APIError{
		Code:    code,
		Message: message,
		Details: details,
	}
}

// ValidationError represents request validation errors
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   interface{} `json:"value,omitempty"`
}

// ValidationErrors represents multiple validation errors
type ValidationErrors struct {
	Errors []ValidationError `json:"errors"`
}

// Error implements the error interface
func (v *ValidationErrors) Error() string {
	return fmt.Sprintf("Validation failed with %d errors", len(v.Errors))
}