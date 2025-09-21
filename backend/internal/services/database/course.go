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

// CreateCourse creates a new course in the database
func (c *Client) CreateCourse(course *models.Course) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		INSERT INTO courses (id, user_id, title, description, status, price, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING created_at, updated_at
	`

	err := c.pool.QueryRow(ctx, query, course.ID, course.UserID, course.Title, course.Description, course.Status, course.Price).
		Scan(&course.CreatedAt, &course.UpdatedAt)
	if err != nil {
		logger.Error("Failed to create course", zap.Error(err))
		return fmt.Errorf("failed to create course: %w", err)
	}

	logger.Info("Course created successfully", zap.String("course_id", course.ID.String()))
	return nil
}

// GetUserCourses retrieves all courses for a user with optional filtering
func (c *Client) GetUserCourses(userID uuid.UUID, status string, limit, offset int) ([]models.Course, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	var query string
	var args []interface{}

	if status != "" {
		query = `
			SELECT id, user_id, title, description, status, total_modules, completed_modules, 
				   students_count, earnings, price, thumbnail_url, created_at, updated_at
			FROM courses 
			WHERE user_id = $1 AND status = $2
			ORDER BY created_at DESC
			LIMIT $3 OFFSET $4
		`
		args = []interface{}{userID, status, limit, offset}
	} else {
		query = `
			SELECT id, user_id, title, description, status, total_modules, completed_modules, 
				   students_count, earnings, price, thumbnail_url, created_at, updated_at
			FROM courses 
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`
		args = []interface{}{userID, limit, offset}
	}

	rows, err := c.pool.Query(ctx, query, args...)
	if err != nil {
		logger.Error("Failed to get user courses", zap.Error(err))
		return nil, fmt.Errorf("failed to get user courses: %w", err)
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		err := rows.Scan(
			&course.ID, &course.UserID, &course.Title, &course.Description, &course.Status,
			&course.TotalModules, &course.CompletedModules, &course.StudentsCount,
			&course.Earnings, &course.Price, &course.ThumbnailURL,
			&course.CreatedAt, &course.UpdatedAt,
		)
		if err != nil {
			logger.Error("Failed to scan course", zap.Error(err))
			return nil, fmt.Errorf("failed to scan course: %w", err)
		}
		courses = append(courses, course)
	}

	if err = rows.Err(); err != nil {
		logger.Error("Error iterating over courses", zap.Error(err))
		return nil, fmt.Errorf("error iterating over courses: %w", err)
	}

	return courses, nil
}

// GetCourse retrieves a specific course by ID and user ID
func (c *Client) GetCourse(courseID, userID uuid.UUID) (*models.Course, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT id, user_id, title, description, status, total_modules, completed_modules, 
			   students_count, earnings, price, thumbnail_url, created_at, updated_at
		FROM courses 
		WHERE id = $1 AND user_id = $2
	`

	var course models.Course
	err := c.pool.QueryRow(ctx, query, courseID, userID).Scan(
		&course.ID, &course.UserID, &course.Title, &course.Description, &course.Status,
		&course.TotalModules, &course.CompletedModules, &course.StudentsCount,
		&course.Earnings, &course.Price, &course.ThumbnailURL,
		&course.CreatedAt, &course.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("course not found")
		}
		logger.Error("Failed to get course", zap.Error(err))
		return nil, fmt.Errorf("failed to get course: %w", err)
	}

	return &course, nil
}

// UpdateCourse updates an existing course
func (c *Client) UpdateCourse(courseID, userID uuid.UUID, req *models.UpdateCourseRequest) (*models.Course, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	// Build dynamic query based on provided fields
	setParts := []string{}
	args := []interface{}{courseID, userID}
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
	if req.Status != nil {
		setParts = append(setParts, fmt.Sprintf("status = $%d", argIndex))
		args = append(args, *req.Status)
		argIndex++
	}
	if req.ThumbnailURL != nil {
		setParts = append(setParts, fmt.Sprintf("thumbnail_url = $%d", argIndex))
		args = append(args, *req.ThumbnailURL)
		argIndex++
	}

	if len(setParts) == 0 {
		// No fields to update, just return the current course
		return c.GetCourse(courseID, userID)
	}

	setParts = append(setParts, "updated_at = NOW()")
	setClause := strings.Join(setParts, ", ")

	query := fmt.Sprintf(`
		UPDATE courses 
		SET %s
		WHERE id = $1 AND user_id = $2
		RETURNING id, user_id, title, description, status, total_modules, completed_modules, 
				  students_count, earnings, price, thumbnail_url, created_at, updated_at
	`, setClause)

	var course models.Course
	err := c.pool.QueryRow(ctx, query, args...).Scan(
		&course.ID, &course.UserID, &course.Title, &course.Description, &course.Status,
		&course.TotalModules, &course.CompletedModules, &course.StudentsCount,
		&course.Earnings, &course.Price, &course.ThumbnailURL,
		&course.CreatedAt, &course.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("course not found")
		}
		logger.Error("Failed to update course", zap.Error(err))
		return nil, fmt.Errorf("failed to update course: %w", err)
	}

	logger.Info("Course updated successfully", zap.String("course_id", courseID.String()))
	return &course, nil
}

// DeleteCourse deletes a course and all its modules
func (c *Client) DeleteCourse(courseID, userID uuid.UUID) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	// Start a transaction
	tx, err := c.pool.Begin(ctx)
	if err != nil {
		logger.Error("Failed to begin transaction", zap.Error(err))
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// First, verify the course exists and belongs to the user
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM courses WHERE id = $1 AND user_id = $2)`
	err = tx.QueryRow(ctx, checkQuery, courseID, userID).Scan(&exists)
	if err != nil {
		logger.Error("Failed to check course existence", zap.Error(err))
		return fmt.Errorf("failed to check course existence: %w", err)
	}
	if !exists {
		return fmt.Errorf("course not found")
	}

	// Delete the course (cascade will handle modules and links)
	deleteQuery := `DELETE FROM courses WHERE id = $1 AND user_id = $2`
	result, err := tx.Exec(ctx, deleteQuery, courseID, userID)
	if err != nil {
		logger.Error("Failed to delete course", zap.Error(err))
		return fmt.Errorf("failed to delete course: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("course not found")
	}

	// Commit the transaction
	if err = tx.Commit(ctx); err != nil {
		logger.Error("Failed to commit transaction", zap.Error(err))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	logger.Info("Course deleted successfully", zap.String("course_id", courseID.String()))
	return nil
}

// GetCourseStats retrieves statistics for a user's courses
func (c *Client) GetCourseStats(userID uuid.UUID) (*models.CourseStats, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT 
			COUNT(*) as total_courses,
			COUNT(CASE WHEN status = 'published' THEN 1 END) as published_courses,
			COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_courses,
			COALESCE(SUM(students_count), 0) as total_students,
			COALESCE(SUM(earnings), 0) as total_earnings
		FROM courses 
		WHERE user_id = $1
	`

	var stats models.CourseStats
	err := c.pool.QueryRow(ctx, query, userID).Scan(
		&stats.TotalCourses,
		&stats.PublishedCourses,
		&stats.DraftCourses,
		&stats.TotalStudents,
		&stats.TotalEarnings,
	)
	if err != nil {
		logger.Error("Failed to get course stats", zap.Error(err))
		return nil, fmt.Errorf("failed to get course stats: %w", err)
	}

	return &stats, nil
}
