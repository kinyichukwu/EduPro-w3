package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/pgvector/pgvector-go"
	"go.uber.org/zap"
)

// PgxClient represents the pgx database client for vector operations
type PgxClient struct {
	pool *pgxpool.Pool
}

// NewPgxClient creates a new pgx client for vector operations
func NewPgxClient(cfg *config.Config) (*PgxClient, error) {
	logger := utils.GetLogger()

	// Configure connection pool
	config, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		logger.Error("Failed to parse database URL", zap.Error(err))
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Set pool configuration
	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = time.Hour
	config.MaxConnIdleTime = time.Minute * 30

	// Create connection pool
	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		logger.Error("Failed to create connection pool", zap.Error(err))
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := pool.Ping(ctx); err != nil {
		logger.Error("Failed to ping database", zap.Error(err))
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("PGX connection pool established successfully")
	return &PgxClient{pool: pool}, nil
}

// Close closes the connection pool
func (c *PgxClient) Close() {
	c.pool.Close()
}

// GetPool returns the underlying connection pool
func (c *PgxClient) GetPool() *pgxpool.Pool {
	return c.pool
}

// SearchSimilarChunks performs vector similarity search
func (c *PgxClient) SearchSimilarChunks(ctx context.Context, embedding []float32, userID string, limit int) ([]ChunkResult, error) {
	logger := utils.GetLogger()

	query := `
		SELECT 
			c.id,
			c.document_id,
			c.ordinal,
			c.content,
			c.metadata,
			d.title,
			d.source_url,
			c.embedding <=> $1 as distance
		FROM chunks c
		JOIN documents d ON c.document_id = d.id
		WHERE d.user_id = $2
		ORDER BY c.embedding <=> $1
		LIMIT $3
	`

	// Convert embedding to pgvector format
	vec := pgvector.NewVector(embedding)

	rows, err := c.pool.Query(ctx, query, vec, userID, limit)
	if err != nil {
		logger.Error("Failed to search similar chunks", zap.Error(err))
		return nil, fmt.Errorf("failed to search similar chunks: %w", err)
	}
	defer rows.Close()

	var results []ChunkResult
	for rows.Next() {
		var result ChunkResult
		err := rows.Scan(
			&result.ID,
			&result.DocumentID,
			&result.Ordinal,
			&result.Content,
			&result.Metadata,
			&result.DocumentTitle,
			&result.SourceURL,
			&result.Distance,
		)
		if err != nil {
			logger.Error("Failed to scan chunk result", zap.Error(err))
			continue
		}
		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		logger.Error("Error iterating chunk results", zap.Error(err))
		return nil, fmt.Errorf("error iterating chunk results: %w", err)
	}

	logger.Info("Similar chunks search completed",
		zap.Int("results_count", len(results)),
		zap.String("user_id", userID),
	)

	return results, nil
}

// InsertChunks inserts multiple chunks with embeddings in a batch
func (c *PgxClient) InsertChunks(ctx context.Context, chunks []ChunkInsert) error {
	logger := utils.GetLogger()

	if len(chunks) == 0 {
		return nil
	}

	query := `
		INSERT INTO chunks (document_id, ordinal, content, embedding, metadata)
		VALUES ($1, $2, $3, $4, $5)
	`

	batch := &pgx.Batch{}
	for _, chunk := range chunks {
		vec := pgvector.NewVector(chunk.Embedding)
		batch.Queue(query, chunk.DocumentID, chunk.Ordinal, chunk.Content, vec, chunk.Metadata)
	}

	results := c.pool.SendBatch(ctx, batch)
	defer results.Close()

	for i := 0; i < len(chunks); i++ {
		_, err := results.Exec()
		if err != nil {
			logger.Error("Failed to insert chunk",
				zap.Error(err),
				zap.Int("chunk_index", i),
			)
			return fmt.Errorf("failed to insert chunk %d: %w", i, err)
		}
	}

	logger.Info("Chunks inserted successfully", zap.Int("count", len(chunks)))
	return nil
}

// ChunkResult represents a search result
type ChunkResult struct {
	ID            string      `json:"id"`
	DocumentID    string      `json:"document_id"`
	Ordinal       int         `json:"ordinal"`
	Content       string      `json:"content"`
	Metadata      interface{} `json:"metadata"`
	DocumentTitle string      `json:"document_title"`
	SourceURL     *string     `json:"source_url"`
	Distance      float64     `json:"distance"`
}

// ChunkInsert represents data for inserting a chunk
type ChunkInsert struct {
	DocumentID string      `json:"document_id"`
	Ordinal    int         `json:"ordinal"`
	Content    string      `json:"content"`
	Embedding  []float32   `json:"embedding"`
	Metadata   interface{} `json:"metadata"`
}
