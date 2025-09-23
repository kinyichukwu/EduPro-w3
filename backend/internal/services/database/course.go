package database

import (
	"context"
	"fmt"
	"strings"
	"time"

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

// GetCourseForLearning retrieves a course for learning (must be published)
func (c *Client) GetCourseForLearning(courseID uuid.UUID) (*models.Course, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	query := `
		SELECT id, user_id, title, description, status, total_modules, completed_modules, 
			   students_count, earnings, price, thumbnail_url, created_at, updated_at
		FROM courses 
		WHERE id = $1 AND status = 'published'
	`

	var course models.Course
	err := c.pool.QueryRow(ctx, query, courseID).Scan(
		&course.ID, &course.UserID, &course.Title, &course.Description, &course.Status,
		&course.TotalModules, &course.CompletedModules, &course.StudentsCount,
		&course.Earnings, &course.Price, &course.ThumbnailURL,
		&course.CreatedAt, &course.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("course not found")
		}
		logger.Error("Failed to get course for learning", zap.Error(err))
		return nil, fmt.Errorf("failed to get course for learning: %w", err)
	}

	return &course, nil
}

// GetUserCourseProgress retrieves user's progress in a course
func (c *Client) GetUserCourseProgress(courseID, userID uuid.UUID) (*models.CourseProgressResponse, error) {
	logger := utils.GetLogger()
	ctx := context.Background()

	// First, ensure user is enrolled
	enrollmentQuery := `
		SELECT id, enrolled_at, completed_at, progress
		FROM course_enrollments 
		WHERE course_id = $1 AND user_id = $2
	`

	var enrollmentID uuid.UUID
	var enrolledAt time.Time
	var completedAt *time.Time
	var overallProgress float64

	err := c.pool.QueryRow(ctx, enrollmentQuery, courseID, userID).Scan(
		&enrollmentID, &enrolledAt, &completedAt, &overallProgress,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("enrollment not found")
		}
		logger.Error("Failed to get enrollment", zap.Error(err))
		return nil, fmt.Errorf("failed to get enrollment: %w", err)
	}

	// Get total modules and completed modules count
	moduleStatsQuery := `
		SELECT 
			COUNT(*) as total_modules,
			COUNT(CASE WHEN mp.completed = true THEN 1 END) as completed_modules
		FROM course_modules cm
		LEFT JOIN module_progress mp ON cm.id = mp.module_id AND mp.user_id = $2
		WHERE cm.course_id = $1
	`

	var totalModules, completedModules int
	err = c.pool.QueryRow(ctx, moduleStatsQuery, courseID, userID).Scan(
		&totalModules, &completedModules,
	)
	if err != nil {
		logger.Error("Failed to get module stats", zap.Error(err))
		return nil, fmt.Errorf("failed to get module stats: %w", err)
	}

	// Calculate progress based on completed modules if not set
	if totalModules > 0 && overallProgress == 0 {
		overallProgress = float64(completedModules) / float64(totalModules) * 100
	}

	progress := &models.CourseProgressResponse{
		CourseID:         courseID,
		UserID:           userID,
		Progress:         overallProgress,
		CompletedModules: completedModules,
		TotalModules:     totalModules,
		EnrolledAt:       enrolledAt,
		CompletedAt:      completedAt,
	}

	return progress, nil
}

// UpdateModuleProgress updates or creates user's progress for a specific module
func (c *Client) UpdateModuleProgress(userID, moduleID uuid.UUID, completed bool, progress float64) error {
	logger := utils.GetLogger()
	ctx := context.Background()

	// Start a transaction
	tx, err := c.pool.Begin(ctx)
	if err != nil {
		logger.Error("Failed to begin transaction", zap.Error(err))
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Upsert module progress
	upsertQuery := `
		INSERT INTO module_progress (id, user_id, module_id, completed, progress, started_at, completed_at, created_at, updated_at)
		VALUES (uuid_generate_v4(), $1, $2, $3, $4, 
			CASE WHEN $5 IS NULL THEN NOW() ELSE $5 END,
			CASE WHEN $3 = true THEN NOW() ELSE NULL END,
			NOW(), NOW())
		ON CONFLICT (user_id, module_id) 
		DO UPDATE SET 
			completed = $3,
			progress = $4,
			started_at = COALESCE(module_progress.started_at, NOW()),
			completed_at = CASE WHEN $3 = true THEN NOW() ELSE module_progress.completed_at END,
			updated_at = NOW()
	`

	// Get current started_at if exists
	var startedAt *time.Time
	getStartedQuery := `SELECT started_at FROM module_progress WHERE user_id = $1 AND module_id = $2`
	tx.QueryRow(ctx, getStartedQuery, userID, moduleID).Scan(&startedAt)

	_, err = tx.Exec(ctx, upsertQuery, userID, moduleID, completed, progress, startedAt)
	if err != nil {
		logger.Error("Failed to update module progress", zap.Error(err))
		return fmt.Errorf("failed to update module progress: %w", err)
	}

	// Get course ID for this module
	var courseID uuid.UUID
	courseQuery := `SELECT course_id FROM course_modules WHERE id = $1`
	err = tx.QueryRow(ctx, courseQuery, moduleID).Scan(&courseID)
	if err != nil {
		logger.Error("Failed to get course ID", zap.Error(err))
		return fmt.Errorf("failed to get course ID: %w", err)
	}

	// Ensure user is enrolled in the course
	enrollQuery := `
		INSERT INTO course_enrollments (id, course_id, user_id, enrolled_at, progress)
		VALUES (uuid_generate_v4(), $1, $2, NOW(), 0.0)
		ON CONFLICT (course_id, user_id) DO NOTHING
	`
	_, err = tx.Exec(ctx, enrollQuery, courseID, userID)
	if err != nil {
		logger.Error("Failed to ensure enrollment", zap.Error(err))
		return fmt.Errorf("failed to ensure enrollment: %w", err)
	}

	// Update overall course progress
	updateProgressQuery := `
		UPDATE course_enrollments 
		SET progress = (
			SELECT COALESCE(AVG(CASE WHEN mp.completed THEN 100.0 ELSE mp.progress END), 0)
			FROM course_modules cm
			LEFT JOIN module_progress mp ON cm.id = mp.module_id AND mp.user_id = $2
			WHERE cm.course_id = $1
		),
		completed_at = CASE 
			WHEN (
				SELECT COUNT(*) FROM course_modules WHERE course_id = $1
			) = (
				SELECT COUNT(*) FROM course_modules cm
				INNER JOIN module_progress mp ON cm.id = mp.module_id 
				WHERE cm.course_id = $1 AND mp.user_id = $2 AND mp.completed = true
			) THEN NOW()
			ELSE NULL 
		END
		WHERE course_id = $1 AND user_id = $2
	`
	_, err = tx.Exec(ctx, updateProgressQuery, courseID, userID)
	if err != nil {
		logger.Error("Failed to update course progress", zap.Error(err))
		return fmt.Errorf("failed to update course progress: %w", err)
	}

	// Commit the transaction
	if err = tx.Commit(ctx); err != nil {
		logger.Error("Failed to commit transaction", zap.Error(err))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	logger.Info("Module progress updated successfully", 
		zap.String("user_id", userID.String()),
		zap.String("module_id", moduleID.String()),
		zap.Bool("completed", completed),
		zap.Float64("progress", progress))

	return nil
}
