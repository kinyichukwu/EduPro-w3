package database

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// CreateModule creates a new module in the database
func (c *Client) CreateModule(module *models.CourseModule) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		INSERT INTO course_modules (id, course_id, title, description, content, order_index, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING created_at, updated_at
	`

	err := c.pool.QueryRow(ctx, query, module.ID, module.CourseID, module.Title, module.Description, 
		module.Content, module.OrderIndex, module.Status).
		Scan(&module.CreatedAt, &module.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create module", zap.Error(err))
		return fmt.Errorf("failed to create module: %w", err)
	}

	logger.Info("Module created successfully", zap.String("module_id", module.ID.String()))
	return nil
}

// GetCourseModules retrieves all modules for a course
func (c *Client) GetCourseModules(courseID uuid.UUID) ([]models.CourseModule, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT id, course_id, title, description, content, order_index, status, created_at, updated_at
		FROM course_modules 
		WHERE course_id = $1
		ORDER BY order_index ASC
	`

	rows, err := c.pool.Query(ctx, query, courseID)
	if err != nil {
		logger.Error("Failed to get course modules", zap.Error(err))
		return nil, fmt.Errorf("failed to get course modules: %w", err)
	}
	defer rows.Close()

	var modules []models.CourseModule
	for rows.Next() {
		var module models.CourseModule
		err := rows.Scan(
			&module.ID, &module.CourseID, &module.Title, &module.Description,
			&module.Content, &module.OrderIndex, &module.Status,
			&module.CreatedAt, &module.UpdatedAt,
		)
		if err != nil {
			logger.Error("Failed to scan module", zap.Error(err))
			return nil, fmt.Errorf("failed to scan module: %w", err)
		}
		modules = append(modules, module)
	}

	if err = rows.Err(); err != nil {
		logger.Error("Error iterating over modules", zap.Error(err))
		return nil, fmt.Errorf("error iterating over modules: %w", err)
	}

	return modules, nil
}

// GetModule retrieves a specific module by ID and course ID
func (c *Client) GetModule(moduleID, courseID uuid.UUID) (*models.CourseModule, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT id, course_id, title, description, content, order_index, status, created_at, updated_at
		FROM course_modules 
		WHERE id = $1 AND course_id = $2
	`

	var module models.CourseModule
	err := c.pool.QueryRow(ctx, query, moduleID, courseID).Scan(
		&module.ID, &module.CourseID, &module.Title, &module.Description,
		&module.Content, &module.OrderIndex, &module.Status,
		&module.CreatedAt, &module.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("module not found")
		}
		logger.Error("Failed to get module", zap.Error(err))
		return nil, fmt.Errorf("failed to get module: %w", err)
	}

	return &module, nil
}

// UpdateModule updates an existing module
func (c *Client) UpdateModule(moduleID, courseID uuid.UUID, req *models.UpdateModuleRequest) (*models.CourseModule, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	// Build dynamic query based on provided fields
	setParts := []string{}
	args := []interface{}{moduleID, courseID}
	argIndex := 3

	if req.Title != nil {
		setParts = append(setParts, fmt.Sprintf("title = $%d", argIndex))
		args = append(args, *req.Title)
		argIndex++
	}
	if req.Description != nil {
		setParts = append(setParts, fmt.Sprintf("description = $%d", argIndex))
		args = append(args, *req.Description)
		argIndex++
	}
	if req.Content != nil {
		setParts = append(setParts, fmt.Sprintf("content = $%d", argIndex))
		args = append(args, *req.Content)
		argIndex++
	}
	if req.OrderIndex != nil {
		setParts = append(setParts, fmt.Sprintf("order_index = $%d", argIndex))
		args = append(args, *req.OrderIndex)
		argIndex++
	}
	if req.Status != nil {
		setParts = append(setParts, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *req.Status)
		argIndex++
	}

	if len(setParts) == 0 {
		// No fields to update, just return the current module
		return c.GetModule(moduleID, courseID)
	}

	setParts = append(setParts, "updated_at = NOW()")
	setClause := strings.Join(setParts, ", ")

	query := fmt.Sprintf(`
		UPDATE course_modules 
		SET %s
		WHERE id = $1 AND course_id = $2
		RETURNING id, course_id, title, description, content, order_index, status, created_at, updated_at
	`, setClause)

	var module models.CourseModule
	err := c.pool.QueryRow(ctx, query, args...).Scan(
		&module.ID, &module.CourseID, &module.Title, &module.Description,
		&module.Content, &module.OrderIndex, &module.Status,
		&module.CreatedAt, &module.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("module not found")
		}
		logger.Error("Failed to update module", zap.Error(err))
		return nil, fmt.Errorf("failed to update module: %w", err)
	}

	logger.Info("Module updated successfully", zap.String("module_id", moduleID.String()))
	return &module, nil
}

// DeleteModule deletes a module and all its links
func (c *Client) DeleteModule(moduleID, courseID uuid.UUID) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	// Start a transaction
	tx, err := c.pool.Begin(ctx)
	if err != nil {
		logger.Error("Failed to begin transaction", zap.Error(err))
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// First, verify the module exists and belongs to the course
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM course_modules WHERE id = $1 AND course_id = $2)`
	err = tx.QueryRow(ctx, checkQuery, moduleID, courseID).Scan(&exists)
	if err != nil {
		logger.Error("Failed to check module existence", zap.Error(err))
		return fmt.Errorf("failed to check module existence: %w", err)
	}
	if !exists {
		return fmt.Errorf("module not found")
	}

	// Delete the module (cascade will handle links)
	deleteQuery := `DELETE FROM course_modules WHERE id = $1 AND course_id = $2`
	result, err := tx.Exec(ctx, deleteQuery, moduleID, courseID)
	if err != nil {
		logger.Error("Failed to delete module", zap.Error(err))
		return fmt.Errorf("failed to delete module: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("module not found")
	}

	// Commit the transaction
	if err = tx.Commit(ctx); err != nil {
		logger.Error("Failed to commit transaction", zap.Error(err))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	logger.Info("Module deleted successfully", zap.String("module_id", moduleID.String()))
	return nil
}

// CreateModuleLink creates a new link for a module
func (c *Client) CreateModuleLink(link *models.ModuleLink) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		INSERT INTO module_links (id, module_id, url, title, description, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING created_at
	`

	err := c.pool.QueryRow(ctx, query, link.ID, link.ModuleID, link.URL, link.Title, link.Description).
		Scan(&link.CreatedAt)
	if err != nil {
		logger.Error("Failed to create module link", zap.Error(err))
		return fmt.Errorf("failed to create module link: %w", err)
	}

	logger.Info("Module link created successfully", zap.String("link_id", link.ID.String()))
	return nil
}

// GetModuleLinks retrieves all links for a module
func (c *Client) GetModuleLinks(moduleID uuid.UUID) ([]models.ModuleLink, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT id, module_id, url, title, description, created_at
		FROM module_links 
		WHERE module_id = $1
		ORDER BY created_at ASC
	`

	rows, err := c.pool.Query(ctx, query, moduleID)
	if err != nil {
		logger.Error("Failed to get module links", zap.Error(err))
		return nil, fmt.Errorf("failed to get module links: %w", err)
	}
	defer rows.Close()

	var links []models.ModuleLink
	for rows.Next() {
		var link models.ModuleLink
		err := rows.Scan(
			&link.ID, &link.ModuleID, &link.URL, &link.Title,
			&link.Description, &link.CreatedAt,
		)
		if err != nil {
			logger.Error("Failed to scan module link", zap.Error(err))
			return nil, fmt.Errorf("failed to scan module link: %w", err)
		}
		links = append(links, link)
	}

	if err = rows.Err(); err != nil {
		logger.Error("Error iterating over module links", zap.Error(err))
		return nil, fmt.Errorf("error iterating over module links: %w", err)
	}

	return links, nil
}

// DeleteModuleLink deletes a specific link from a module
func (c *Client) DeleteModuleLink(linkID, moduleID uuid.UUID) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `DELETE FROM module_links WHERE id = $1 AND module_id = $2`
	result, err := c.pool.Exec(ctx, query, linkID, moduleID)
	if err != nil {
		logger.Error("Failed to delete module link", zap.Error(err))
		return fmt.Errorf("failed to delete module link: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("link not found")
	}

	logger.Info("Module link deleted successfully", zap.String("link_id", linkID.String()))
	return nil
}
