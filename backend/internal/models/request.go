package models

import (
	"github.com/kinyichukwu/edu-pro-backend/pkg/constants"
)

// QueryRequest represents the main API request structure
type QueryRequest struct {
	Task     string `json:"task" validate:"required,oneof=quiz explain"`
	Query    string `json:"query" validate:"required,min=3,max=1000"`
	Subject  string `json:"subject,omitempty" validate:"omitempty,max=100"`
	Level    string `json:"level,omitempty" validate:"omitempty,max=50"`
	Language string `json:"language,omitempty" validate:"omitempty,oneof=en yo ig ha"`
}

// QuizOptions contains quiz-specific configuration
type QuizOptions struct {
	NumQuestions int    `json:"num_questions,omitempty" validate:"omitempty,min=1,max=10"`
	Difficulty   string `json:"difficulty,omitempty" validate:"omitempty,oneof=easy medium hard"`
	QuestionType string `json:"question_type,omitempty" validate:"omitempty,oneof=mcq true_false short"`
}

// ExplainOptions contains explanation-specific configuration
type ExplainOptions struct {
	DetailLevel     string `json:"detail_level,omitempty" validate:"omitempty,oneof=simple detailed advanced"`
	IncludeExamples bool   `json:"include_examples,omitempty"`
}

// GetQuizQuestions returns the number of questions to generate
func (q *QueryRequest) GetQuizQuestions() int {
	// For now, return default since QuizOptions isn't part of QueryRequest
	// This will be extended in Phase 2
	return constants.DefaultQuizQuestions
}

// IsValid checks if the task type is valid
func (q *QueryRequest) IsValid() bool {
	for _, validTask := range constants.ValidTasks {
		if q.Task == validTask {
			return true
		}
	}
	return false
}

// RegisterRequest represents the request to register a new user
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Username string `json:"username" validate:"required,min=3,max=50"`
	FullName string `json:"full_name,omitempty"`
}

// LoginRequest represents the request to login
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RAG Request Models

// AskRequest represents a question to the RAG system
type AskRequest struct {
	Query       string   `json:"query" validate:"required,min=3,max=1000"`
	ChatID      string   `json:"chat_id,omitempty"`
	DocumentIDs []string `json:"document_ids,omitempty"`
}

// UpdateChatRequest represents a request to update chat details
type UpdateChatRequest struct {
	Title *string `json:"title,omitempty" validate:"omitempty,max=200"`
}
