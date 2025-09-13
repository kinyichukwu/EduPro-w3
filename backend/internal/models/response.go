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
	RequestID      string  `json:"request_id,omitempty"`
	ProcessingTime float64 `json:"processing_time_ms,omitempty"`
	Version        string  `json:"version,omitempty"`
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

// AuthResponse represents authentication response
type AuthResponse struct {
	AccessToken string       `json:"access_token"`
	TokenType   string       `json:"token_type"`
	ExpiresIn   int          `json:"expires_in"`
	User        *UserProfile `json:"user"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

// RAG Response Models

// DocumentResponse represents a document
type DocumentResponse struct {
	ID               string    `json:"id"`
	Title            string    `json:"title"`
	SourceURL        *string   `json:"source_url"`
	MimeType         string    `json:"mime_type"`
	ProcessingStatus string    `json:"processing_status"`
	Error            *string   `json:"error,omitempty"`
	Size             *int64    `json:"size,omitempty"`
	Checksum         *string   `json:"checksum,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}

// DocumentsResponse represents paginated documents
type DocumentsResponse struct {
	Documents []DocumentResponse `json:"documents"`
	Page      int                `json:"page"`
	Total     int                `json:"total"`
	HasMore   bool               `json:"has_more"`
}

// ChatResponse represents a chat
type ChatResponse struct {
	ID          string    `json:"id"`
	Title       *string   `json:"title,omitempty"`
	LastMessage *string   `json:"last_message"`
	CreatedAt   time.Time `json:"created_at"`
}

// ChatsResponse represents paginated chats
type ChatsResponse struct {
	Chats   []ChatResponse `json:"chats"`
	Page    int            `json:"page"`
	Total   int            `json:"total"`
	HasMore bool           `json:"has_more"`
}

// ChatMessageResponse represents a chat message
type ChatMessageResponse struct {
	ID        string      `json:"id"`
	Role      string      `json:"role"`
	Content   string      `json:"content"`
	Metadata  interface{} `json:"metadata,omitempty"`
	CreatedAt time.Time   `json:"created_at"`
}

// ChatMessagesResponse represents paginated chat messages
type ChatMessagesResponse struct {
	Messages []ChatMessageResponse `json:"messages"`
	Page     int                   `json:"page"`
	Total    int                   `json:"total"`
	HasMore  bool                  `json:"has_more"`
}

// Citation represents a source citation
type Citation struct {
	DocumentID    string  `json:"document_id"`
	DocumentTitle string  `json:"document_title"`
	Ordinal       int     `json:"ordinal"`
	Snippet       string  `json:"snippet"`
	SourceURL     *string `json:"source_url"`
}

// AskResponse represents the response to an ask query
type AskResponse struct {
	ChatID    string     `json:"chat_id"`
	Answer    string     `json:"answer"`
	Citations []Citation `json:"citations"`
}

// UploadResponse represents file upload response
type UploadResponse struct {
	DocumentID string `json:"document_id"`
	Title      string `json:"title"`
	SourceURL  string `json:"source_url"`
	MimeType   string `json:"mime_type"`
}

// ChunkResponse represents a document chunk
type ChunkResponse struct {
	ID        string      `json:"id"`
	Ordinal   int         `json:"ordinal"`
	Content   string      `json:"content"`
	Metadata  interface{} `json:"metadata,omitempty"`
	CreatedAt time.Time   `json:"created_at"`
}

// DocumentChunksResponse represents paginated document chunks
type DocumentChunksResponse struct {
	Chunks  []ChunkResponse `json:"chunks"`
	Page    int             `json:"page"`
	Total   int             `json:"total"`
	HasMore bool            `json:"has_more"`
}

// RAGHealthResponse represents RAG system health
type RAGHealthResponse struct {
	Status           string    `json:"status"`
	EmbeddingsHealth bool      `json:"embeddings_health"`
	DatabaseHealth   bool      `json:"database_health"`
	StorageHealth    bool      `json:"storage_health"`
	Timestamp        time.Time `json:"timestamp"`
}
