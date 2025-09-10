package models

import "time"

// APIResponse is the standard response wrapper
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     string      `json:"error,omitempty"`
	Meta      *Meta       `json:"meta,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// Meta contains additional response metadata
type Meta struct {
	RequestID    string  `json:"request_id,omitempty"`
	ProcessingTime float64 `json:"processing_time_ms,omitempty"`
	Version      string  `json:"version,omitempty"`
}

// QuizResponse contains quiz data
type QuizResponse struct {
	Questions []Question `json:"questions"`
	Topic     string     `json:"topic"`
	Subject   string     `json:"subject,omitempty"`
	Level     string     `json:"level,omitempty"`
}

// Question represents a single quiz question
type Question struct {
	ID            string   `json:"id"`
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	CorrectAnswer string   `json:"correct_answer"`
	Explanation   string   `json:"explanation,omitempty"`
}

// ExplanationResponse contains explanation data
type ExplanationResponse struct {
	Explanation string   `json:"explanation"`
	KeyPoints   []string `json:"key_points"`
	Summary     string   `json:"summary,omitempty"`
	Topic       string   `json:"topic"`
	Subject     string   `json:"subject,omitempty"`
	Level       string   `json:"level,omitempty"`
	Examples    []string `json:"examples,omitempty"`
}

// HealthResponse represents health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Version   string    `json:"version"`
	Uptime    string    `json:"uptime"`
}

// TasksResponse lists available tasks
type TasksResponse struct {
	Tasks []TaskInfo `json:"tasks"`
}

// TaskInfo describes a task type
type TaskInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Example     string `json:"example"`
}