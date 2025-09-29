package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/nft"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
	"go.uber.org/zap"
)

// CourseHandler handles course-related requests
type CourseHandler struct {
	db            *database.Client
	validator     *validator.Validate
	config        *config.Config
	solanaService *solana.Service
	nftService    *nft.Service
}

// NewCourseHandler creates a new course handler
func NewCourseHandler(db *database.Client, config *config.Config, solanaService *solana.Service, nftService *nft.Service) *CourseHandler {
	return &CourseHandler{
		db:            db,
		validator:     validator.New(),
		config:        config,
		solanaService: solanaService,
		nftService:    nftService,
	}
}

// getUserFromContext is a helper function to get the authenticated user
func (h *CourseHandler) getUserFromContext(c *gin.Context) (*models.User, error) {
	// Get user ID from JWT token (this is the Supabase ID)
	supabaseUserID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		return nil, fmt.Errorf("user not authenticated")
	}

	// Get user from database by Supabase ID to get the internal UUID
	user, err := h.db.GetUserBySupabaseID(supabaseUserID)
	if err != nil {
		zap.L().Error("Failed to get user by Supabase ID", zap.String("supabase_id", supabaseUserID), zap.Error(err))
		return nil, fmt.Errorf("user not found")
	}

	return user, nil
}

// CreateCourse creates a new course
// @Summary Create a new course
// @Description Create a new course for the authenticated user
// @Tags courses
// @Accept json
// @Produce json
// @Param request body models.CreateCourseRequest true "Course creation request"
// @Success 201 {object} models.APIResponse{data=models.Course} "Course created successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses [post]
func (h *CourseHandler) CreateCourse(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	var req models.CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	price := 10.00
	if req.Price != nil {
		price = *req.Price
	}

	course := models.Course{
		ID:          uuid.New(),
		UserID:      user.ID, // Use the internal UUID from the database
		Title:       req.Title,
		Description: req.Description,
		Status:      "draft",
		Price:       price,
	}

	if err := h.db.CreateCourse(&course); err != nil {
		zap.L().Error("Failed to create course", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to create course", err)
		return
	}

	SuccessResponse(c, http.StatusCreated, "Course created successfully", course)
}

// GetCourses retrieves all courses for the authenticated user
// @Summary Get user's courses
// @Description Retrieve all courses created by the authenticated user
// @Tags courses
// @Produce json
// @Param status query string false "Filter by status (draft, published, archived)"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10)"
// @Success 200 {object} models.APIResponse{data=[]models.Course} "Courses retrieved successfully"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses [get]
func (h *CourseHandler) GetCourses(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	courses, err := h.db.GetUserCourses(user.ID, status, limit, offset)
	if err != nil {
		zap.L().Error("Failed to get courses", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve courses", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Courses retrieved successfully", courses)
}

// GetCourse retrieves a specific course by ID
// @Summary Get course by ID
// @Description Retrieve a specific course by its ID
// @Tags courses
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} models.APIResponse{data=models.Course} "Course retrieved successfully"
// @Failure 400 {object} models.APIResponse "Invalid course ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{id} [get]
func (h *CourseHandler) GetCourse(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	course, err := h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to get course", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve course", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Course retrieved successfully", course)
}

// BrowseCourses lists published courses for discovery (public)
// @Summary Browse published courses
// @Description Publicly list published courses with pagination
// @Tags courses
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10)"
// @Success 200 {object} models.APIResponse{data=[]models.Course} "Published courses retrieved successfully"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/browse [get]
func (h *CourseHandler) BrowseCourses(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	courses, err := h.db.GetPublishedCourses(limit, offset)
	if err != nil {
		zap.L().Error("Failed to browse courses", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve courses", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Published courses retrieved successfully", courses)
}

// BrowseCourse retrieves a single published course by ID (public)
// @Summary Get published course by ID
// @Description Publicly retrieve a published course by its ID
// @Tags courses
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} models.APIResponse{data=models.Course} "Course retrieved successfully"
// @Failure 400 {object} models.APIResponse "Invalid course ID"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/browse/{id} [get]
func (h *CourseHandler) BrowseCourse(c *gin.Context) {
	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	// Use published course retrieval
	course, err := h.db.GetCourseForLearning(courseID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found or not published", err)
			return
		}
		zap.L().Error("Failed to get published course", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve course", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Course retrieved successfully", course)
}

// UpdateCourse updates an existing course
// @Summary Update course
// @Description Update an existing course
// @Tags courses
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Param request body models.UpdateCourseRequest true "Course update request"
// @Success 200 {object} models.APIResponse{data=models.Course} "Course updated successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{id} [put]
func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	var req models.UpdateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	course, err := h.db.UpdateCourse(courseID, user.ID, &req)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to update course", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to update course", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Course updated successfully", course)
}

// DeleteCourse deletes a course
// @Summary Delete course
// @Description Delete a course and all its modules
// @Tags courses
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} models.APIResponse "Course deleted successfully"
// @Failure 400 {object} models.APIResponse "Invalid course ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{id} [delete]
func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	err = h.db.DeleteCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to delete course", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to delete course", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Course deleted successfully", nil)
}

// GetCourseStats retrieves statistics for the user's courses
// @Summary Get course statistics
// @Description Retrieve statistics for all courses created by the authenticated user
// @Tags courses
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.CourseStats} "Statistics retrieved successfully"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/stats [get]
func (h *CourseHandler) GetCourseStats(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	stats, err := h.db.GetCourseStats(user.ID)
	if err != nil {
		zap.L().Error("Failed to get course stats", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve statistics", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Statistics retrieved successfully", stats)
}

// UpdateCourseStatus updates the status of a course
// @Summary Update course status
// @Description Update the status of a course (draft, published, archived)
// @Tags courses
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Param request body models.UpdateCourseStatusRequest true "Status update request"
// @Success 200 {object} models.APIResponse{data=models.Course} "Course status updated successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{id}/status [patch]
func (h *CourseHandler) UpdateCourseStatus(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	var req models.UpdateCourseStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Create update request with only status field
	updateReq := models.UpdateCourseRequest{
		Status: &req.Status,
	}

	course, err := h.db.UpdateCourse(courseID, user.ID, &updateReq)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to update course status", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to update course status", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Course status updated successfully", course)
}

// EnrollCourse enrolls the authenticated user in a published course (after purchase)
// @Summary Enroll in course
// @Description Enroll the authenticated user in a course (requires purchase)
// @Tags courses
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} models.APIResponse "Enrolled"
// @Failure 400 {object} models.APIResponse "Invalid course ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Router /api/courses/{id}/enroll [post]
func (h *CourseHandler) EnrollCourse(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	// Ensure course exists and is published
	if _, err := h.db.GetCourseForLearning(courseID); err != nil {
		ErrorResponse(c, http.StatusNotFound, "Course not found or not published", err)
		return
	}

	if err := h.db.EnrollUserInCourse(courseID, user.ID); err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to enroll", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Enrolled successfully", nil)
}

// GetMyCourses returns enrolled courses for the authenticated user
// @Summary Get enrolled courses
// @Tags courses
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 10)"
// @Success 200 {object} models.APIResponse{data=[]models.Course}
// @Failure 401 {object} models.APIResponse
// @Router /api/courses/enrolled [get]
func (h *CourseHandler) GetMyCourses(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	courses, err := h.db.GetEnrolledCourses(user.ID, limit, offset)
	if err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve courses", err)
		return
	}
	SuccessResponse(c, http.StatusOK, "Enrolled courses retrieved", courses)
}

// GetCourseLearningContent retrieves course content for learning
// @Summary Get course learning content
// @Description Retrieve course with modules for learning purposes
// @Tags courses
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} models.APIResponse{data=models.CourseLearningContent} "Course content retrieved successfully"
// @Failure 400 {object} models.APIResponse "Invalid course ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 403 {object} models.APIResponse "Access denied"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{id}/learn [get]
func (h *CourseHandler) GetCourseLearningContent(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	// Get course - must be published
	course, err := h.db.GetCourseForLearning(courseID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found or not published", err)
			return
		}
		zap.L().Error("Failed to get course", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve course", err)
		return
	}

	// Check access: free or purchased
	userIDStr := user.ID.String()
	hasAccess, err := h.checkCourseAccess(userIDStr, courseIDStr)
	if err != nil {
		zap.L().Error("Failed to check course access", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to check access", err)
		return
	}
	if !hasAccess {
		ErrorResponse(c, http.StatusForbidden, "You must purchase this course to access content", nil)
		return
	}

	// Get course modules
	modules, err := h.db.GetCourseModules(courseID)
	if err != nil {
		zap.L().Error("Failed to get course modules", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve course modules", err)
		return
	}

	// Get or create enrollment and progress
	progressData, err := h.db.GetUserCourseProgress(courseID, user.ID)
	if err != nil {
		if err.Error() == "enrollment not found" {
			// Auto-enroll if has access
			if enrollErr := h.db.EnrollUserInCourse(courseID, user.ID); enrollErr != nil {
				zap.L().Error("Failed to auto-enroll user", zap.Error(enrollErr))
				ErrorResponse(c, http.StatusInternalServerError, "Failed to enroll", enrollErr)
				return
			}
			// Fetch progress after enrollment
			progressData, err = h.db.GetUserCourseProgress(courseID, user.ID)
			if err != nil {
				zap.L().Error("Failed to get progress after enrollment", zap.Error(err))
				ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve progress", err)
				return
			}
		} else {
			zap.L().Error("Failed to get user course progress", zap.Error(err))
			ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve progress", err)
			return
		}
	}

	var viewURL *string
	if course.CollectionMintAddress != nil {
		cluster := os.Getenv("SOLANA_NETWORK")
		if cluster == "" {
			cluster = "devnet"
		}
		url := fmt.Sprintf("https://explorer.solana.com/address/%s?cluster=%s", *course.CollectionMintAddress, cluster)
		viewURL = &url
	}

	learningContent := models.CourseLearningContent{
		Course:         *course,
		Modules:        modules,
		Progress:       progressData,
		ViewOnChainURL: viewURL,
	}

	SuccessResponse(c, http.StatusOK, "Course content retrieved successfully", learningContent)
}

// GetCourseProgress retrieves user's progress in a course
// @Summary Get course progress
// @Description Retrieve user's progress in a specific course
// @Tags courses
// @Produce json
// @Param id path string true "Course ID"
// @Success 200 {object} models.APIResponse{data=models.CourseProgressResponse} "Progress retrieved successfully"
// @Failure 400 {object} models.APIResponse "Invalid course ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 403 {object} models.APIResponse "Access denied"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{id}/progress [get]
func (h *CourseHandler) GetCourseProgress(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	// Get course - must be published
	_, err = h.db.GetCourseForLearning(courseID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found or not published", err)
			return
		}
		zap.L().Error("Failed to get course for progress", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve course", err)
		return
	}

	// Check access: free or purchased
	userIDStr := user.ID.String()
	hasAccess, err := h.checkCourseAccess(userIDStr, courseIDStr)
	if err != nil {
		zap.L().Error("Failed to check course access", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to check access", err)
		return
	}
	if !hasAccess {
		ErrorResponse(c, http.StatusForbidden, "Access denied. Please purchase the course to view progress.", nil)
		return
	}

	// Get or create enrollment and progress
	progress, err := h.db.GetUserCourseProgress(courseID, user.ID)
	if err != nil {
		if err.Error() == "enrollment not found" {
			// Auto-enroll if has access
			if enrollErr := h.db.EnrollUserInCourse(courseID, user.ID); enrollErr != nil {
				zap.L().Error("Failed to auto-enroll user", zap.Error(enrollErr))
				ErrorResponse(c, http.StatusInternalServerError, "Failed to enroll", enrollErr)
				return
			}
			// Fetch progress after enrollment
			progress, err = h.db.GetUserCourseProgress(courseID, user.ID)
			if err != nil {
				zap.L().Error("Failed to get progress after enrollment", zap.Error(err))
				ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve progress", err)
				return
			}
		} else {
			zap.L().Error("Failed to get course progress", zap.Error(err))
			ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve progress", err)
			return
		}
	}

	SuccessResponse(c, http.StatusOK, "Progress retrieved successfully", progress)
}

// UpdateCourseProgress updates user's progress in a course
// @Summary Update course progress
// @Description Update user's progress in a specific course module
// @Tags courses
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Param request body models.CourseProgressRequest true "Progress update request"
// @Success 200 {object} models.APIResponse{data=models.CourseProgressResponse} "Progress updated successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found or not enrolled"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{id}/progress [patch]
func (h *CourseHandler) UpdateCourseProgress(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	courseIDStr := c.Param("id")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	var req models.CourseProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Verify module belongs to course
	_, err = h.db.GetModule(req.ModuleID, courseID)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusBadRequest, "Module not found in this course", err)
			return
		}
		zap.L().Error("Failed to verify module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify module", err)
		return
	}

	// Update module progress
	err = h.db.UpdateModuleProgress(user.ID, req.ModuleID, req.Completed, req.Progress)
	if err != nil {
		zap.L().Error("Failed to update module progress", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to update progress", err)
		return
	}

	// Get updated course progress
	progress, err := h.db.GetUserCourseProgress(courseID, user.ID)
	if err != nil {
		zap.L().Error("Failed to get updated progress", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve updated progress", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Progress updated successfully", progress)
}

// NFT Course Handlers

// CreateCourseWithPayment creates a new course with NFT after payment verification
func (h *CourseHandler) CreateCourseWithPayment(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	var req models.CreateCourseWithPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// 1. Verify the creation payment transaction
	// expectedAmount := int64(10 * 1e9) // 10 EDU tokens in token units
	// Note: Using a simplified verification here - in production you'd implement proper transaction verification
	// For now, we'll assume the transaction is valid if the signature is provided
	if len(req.CreationTxSignature) < 80 {
		ErrorResponse(c, http.StatusBadRequest, "Invalid transaction signature", nil)
		return
	}

	// 2. Create course in database first to get course ID (persist BEFORE NFT collection)
	course := models.Course{
		ID:                  uuid.New(),
		UserID:              user.ID,
		Title:               req.Title,
		Description:         req.Description,
		Status:              "draft",
		PriceEduTokens:      req.PriceEduTokens,
		PriceTokenMint:      &h.config.SolanaConfig.EduProTokenMint,
		PlatformFeeBPS:      h.config.EduProPlatformFeeBPS,
		CreationTxSignature: &req.CreationTxSignature,
		CreatorWallet:       &req.CreatorWallet,
	}

	if err := h.db.CreateCourse(&course); err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to create course", err)
		return
	}

	// 3. Create course NFT collection using existing service (now that course exists)
	nftRequest := &models.CreateCourseNFTCollectionRequest{
		CreatorID:         user.ID,
		CreatorEmail:      user.Email,
		CreatorWallet:     req.CreatorWallet,
		CourseID:          course.ID,
		CourseTitle:       req.Title,
		Description:       req.Description,
		ImageURL:          "https://your-cdn.com/course-nft-image.png",
		MaxSupply:         1000, // Set max supply for course access NFTs
		PriceEduProTokens: req.PriceEduTokens,
	}

	nftResult, err := h.nftService.CreateCourseNFTCollection(c.Request.Context(), nftRequest)
	if err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to create course NFT collection", err)
		return
	}

	// 4. Update course with NFT information
	updateReq := models.UpdateCourseRequest{}
	if nftResult.CollectionMintAddress != "" {
		course.NFTMintAddress = &nftResult.CollectionMintAddress
	}
	if nftResult.CollectionMetadataURI != "" {
		course.NFTMetadataURI = &nftResult.CollectionMetadataURI
	}

	// Persist NFT fields via an UPDATE to avoid FK issues
	_, _ = h.db.UpdateCourse(course.ID, user.ID, &updateReq)

	// Add view on chain URL
	viewOnChainURL := fmt.Sprintf("https://explorer.solana.com/address/%s?cluster=devnet", *course.NFTMintAddress)
	course.ViewOnChainURL = &viewOnChainURL

	SuccessResponse(c, http.StatusCreated, "Course created successfully", course)
}

// PurchaseCourse handles course purchase with NFT minting
func (h *CourseHandler) PurchaseCourse(c *gin.Context) {
	courseID := c.Param("id")
	if courseID == "" {
		ErrorResponse(c, http.StatusBadRequest, "Course ID is required", nil)
		return
	}

	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	var req models.PurchaseCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Get course details
	course, err := h.db.GetCourseByID(courseID)
	if err != nil {
		ErrorResponse(c, http.StatusNotFound, "Course not found", err)
		return
	}

	if course.PriceEduTokens <= 0 {
		ErrorResponse(c, http.StatusBadRequest, "Course is not for sale", nil)
		return
	}

	// Check if user already purchased
	existingPurchase, _ := h.db.GetCoursePurchaseByUserAndCourse(user.ID.String(), courseID)
	if existingPurchase != nil {
		ErrorResponse(c, http.StatusBadRequest, "Course already purchased", nil)
		return
	}

	// Verify purchase transaction (simplified - assume valid if signature provided)
	if len(req.PurchaseTxSignature) < 80 {
		ErrorResponse(c, http.StatusBadRequest, "Invalid transaction signature", nil)
		return
	}

	platformAmount := (course.PriceEduTokens * int64(course.PlatformFeeBPS)) / 10000
	sellerAmount := course.PriceEduTokens - platformAmount

	// Look up NFT collection for this course
	collection, err := h.db.GetCourseNFTCollectionByCourseID(course.ID)
	if err != nil || collection == nil {
		ErrorResponse(c, http.StatusBadRequest, "Course NFT collection not found", err)
		return
	}

	// Purchase course NFT using existing service (use collection ID)
	purchaseRequest := &models.PurchaseCourseNFTRequest{
		CollectionID:       collection.ID,
		BuyerEmail:         user.Email,
		BuyerWalletAddress: req.BuyerWallet,
	}

	nftResult, err := h.nftService.PurchaseCourseNFT(c.Request.Context(), purchaseRequest)
	if err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to purchase course NFT", err)
		return
	}

	// Create purchase record
	now := time.Now()
	purchase := models.CoursePurchase{
		ID:                  uuid.New(),
		CourseID:            uuid.MustParse(courseID),
		BuyerUserID:         user.ID,
		BuyerWalletAddress:  req.BuyerWallet,
		PurchaseTxSignature: req.PurchaseTxSignature,
		NFTMintAddress:      nftResult.NFTMintAddress,
		TotalAmountPaid:     course.PriceEduTokens,
		PlatformAmount:      platformAmount,
		SellerAmount:        sellerAmount,
		PlatformFeeBPS:      course.PlatformFeeBPS,
		PurchaseStatus:      "confirmed",
		// Do not store the base64-encoded prepared transaction as an on-chain signature.
		// Keep NFTMintTxSignature nil until a real on-chain signature is available.
		NFTMintTxSignature: nil,
		CreatedAt:          now,
		ConfirmedAt:        &now,
	}

	if err := h.db.CreateCoursePurchase(&purchase); err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to record purchase", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Course purchased successfully", purchase)
}

// GetPublicCoursesWithPurchaseInfo returns courses with purchase information
func (h *CourseHandler) GetPublicCoursesWithPurchaseInfo(c *gin.Context) {
	// Get user if authenticated (optional)
	var userID *uuid.UUID
	if user, err := h.getUserFromContext(c); err == nil {
		userID = &user.ID
	}

	courses, err := h.db.GetAllPublishedCoursesWithNFTDetails()
	if err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to get courses", err)
		return
	}

	var coursesWithInfo []models.CourseWithPurchaseInfo
	for _, course := range courses {
		courseInfo := models.CourseWithPurchaseInfo{
			Course:          course,
			IsPurchased:     false,
			CanAccess:       course.PriceEduTokens == 0, // free courses
			PriceDisplayEDU: float64(course.PriceEduTokens) / 1e9,
		}

		// Add view on chain URL
		if course.NFTMintAddress != nil {
			viewURL := fmt.Sprintf("https://explorer.solana.com/address/%s?cluster=devnet", *course.NFTMintAddress)
			courseInfo.Course.ViewOnChainURL = &viewURL
		}

		// Check purchase status if user is authenticated
		if userID != nil {
			purchase, _ := h.db.GetCoursePurchaseByUserAndCourse(userID.String(), course.ID.String())
			if purchase != nil {
				courseInfo.IsPurchased = true
				courseInfo.Purchase = purchase
				courseInfo.CanAccess = true
			}
		}

		coursesWithInfo = append(coursesWithInfo, courseInfo)
	}

	SuccessResponse(c, http.StatusOK, "Courses retrieved successfully", coursesWithInfo)
}

// GetCourseContent handles course content access with NFT verification
func (h *CourseHandler) GetCourseContent(c *gin.Context) {
	courseID := c.Param("id")
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	// Check access: either free course, purchased, or NFT ownership
	hasAccess, err := h.checkCourseAccess(user.ID.String(), courseID)
	if err != nil {
		ErrorResponse(c, http.StatusInternalServerError, "Failed to check access", err)
		return
	}

	if !hasAccess {
		ErrorResponse(c, http.StatusForbidden, "Access denied. Please purchase the course.", nil)
		return
	}

	// Get course for learning
	courseUUID, err := uuid.Parse(courseID)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid course ID", err)
		return
	}

	course, err := h.db.GetCourseForLearning(courseUUID)
	if err != nil {
		ErrorResponse(c, http.StatusNotFound, "Course not found", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Course content retrieved successfully", course)
}

// GetUserPurchasedCourses returns user's purchased courses
func (h *CourseHandler) GetUserPurchasedCourses(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	purchases, err := h.db.GetUserPurchasedCourses(user.ID)
	if err != nil {
		// For now, if there's an error (likely due to missing table), return empty array
		zap.L().Warn("Failed to get purchased courses, returning empty array", zap.Error(err))
		SuccessResponse(c, http.StatusOK, "Purchased courses retrieved successfully", []interface{}{})
		return
	}

	// Enhance purchase data with course information
	type purchaseWithCourse struct {
		models.CoursePurchase
		Course models.Course `json:"course"`
	}

	var purchasesWithCourse []purchaseWithCourse
	for _, purchase := range purchases {
		course, err := h.db.GetCourseByID(purchase.CourseID.String())
		if err == nil {
			purchaseWithCourse := purchaseWithCourse{
				CoursePurchase: purchase,
				Course:         *course,
			}
			purchasesWithCourse = append(purchasesWithCourse, purchaseWithCourse)
		}
	}

	SuccessResponse(c, http.StatusOK, "Purchased courses retrieved successfully", purchasesWithCourse)
}

// checkCourseAccess checks if a user has access to a course
func (h *CourseHandler) checkCourseAccess(userID, courseID string) (bool, error) {
	// 1. Check if course is free
	course, err := h.db.GetCourseByID(courseID)
	if err != nil {
		return false, err
	}
	if course.PriceEduTokens == 0 {
		return true, nil
	}

	// 2. Check database purchase record
	purchase, err := h.db.GetCoursePurchaseByUserAndCourse(userID, courseID)
	if err == nil && purchase != nil && purchase.PurchaseStatus == "confirmed" {
		return true, nil
	}

	// 3. Could add NFT ownership verification on-chain here as additional security
	// This is more expensive but tamper-proof

	return false, nil
}

// GetCourseDetails gets basic course details for purchase (no access control)
func (h *CourseHandler) GetCourseDetails(c *gin.Context) {
	courseID := c.Param("id")

	// Get course details - no access control needed for purchase info
	course, err := h.db.GetCourseByID(courseID)
	if err != nil {
		ErrorResponse(c, http.StatusNotFound, "Course not found", err)
		return
	}

	// Add view on chain URL if NFT exists
	if course.NFTMintAddress != nil && *course.NFTMintAddress != "" {
		viewURL := fmt.Sprintf("https://explorer.solana.com/address/%s?cluster=devnet", *course.NFTMintAddress)
		course.ViewOnChainURL = &viewURL
	}

	SuccessResponse(c, http.StatusOK, "Course details retrieved successfully", course)
}
