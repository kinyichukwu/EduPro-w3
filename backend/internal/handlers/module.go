package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"go.uber.org/zap"
)

// ModuleHandler handles course module-related requests
type ModuleHandler struct {
	db        *database.Client
	validator *validator.Validate
}

// NewModuleHandler creates a new module handler
func NewModuleHandler(db *database.Client) *ModuleHandler {
	return &ModuleHandler{
		db:        db,
		validator: validator.New(),
	}
}

// getUserFromContext is a helper function to get the authenticated user
func (h *ModuleHandler) getUserFromContext(c *gin.Context) (*models.User, error) {
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

// CreateModule creates a new module for a course
// @Summary Create a new module
// @Description Create a new module for a specific course
// @Tags modules
// @Accept json
// @Produce json
// @Param courseId path string true "Course ID"
// @Param request body models.CreateModuleRequest true "Module creation request"
// @Success 201 {object} models.APIResponse{data=models.CourseModule} "Module created successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{courseId}/modules [post]
func (h *ModuleHandler) CreateModule(c *gin.Context) {
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

	var req models.CreateModuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Verify course ownership
	_, err = h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	module := models.CourseModule{
		ID:          uuid.New(),
		CourseID:    courseID,
		Title:       req.Title,
		Description: req.Description,
		Content:     req.Content,
		OrderIndex:  req.OrderIndex,
		Status:      "draft",
	}

	if err := h.db.CreateModule(&module); err != nil {
		zap.L().Error("Failed to create module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to create module", err)
		return
	}

	SuccessResponse(c, http.StatusCreated, "Module created successfully", module)
}

// GetModules retrieves all modules for a course
// @Summary Get course modules
// @Description Retrieve all modules for a specific course
// @Tags modules
// @Produce json
// @Param courseId path string true "Course ID"
// @Success 200 {object} models.APIResponse{data=[]models.CourseModule} "Modules retrieved successfully"
// @Failure 400 {object} models.APIResponse "Invalid course ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Course not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{courseId}/modules [get]
func (h *ModuleHandler) GetModules(c *gin.Context) {
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

	// Verify course ownership
	_, err = h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	modules, err := h.db.GetCourseModules(courseID)
	if err != nil {
		zap.L().Error("Failed to get modules", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve modules", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Modules retrieved successfully", modules)
}

// GetModule retrieves a specific module by ID
// @Summary Get module by ID
// @Description Retrieve a specific module by its ID
// @Tags modules
// @Produce json
// @Param courseId path string true "Course ID"
// @Param moduleId path string true "Module ID"
// @Success 200 {object} models.APIResponse{data=models.ModuleWithLinks} "Module retrieved successfully"
// @Failure 400 {object} models.APIResponse "Invalid ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Module not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{courseId}/modules/{moduleId} [get]
func (h *ModuleHandler) GetModule(c *gin.Context) {
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

	moduleIDStr := c.Param("moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid module ID", err)
		return
	}

	// Verify course ownership
	_, err = h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	module, err := h.db.GetModule(moduleID, courseID)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Module not found", err)
			return
		}
		zap.L().Error("Failed to get module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve module", err)
		return
	}

	links, err := h.db.GetModuleLinks(moduleID)
	if err != nil {
		zap.L().Error("Failed to get module links", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve module links", err)
		return
	}

	moduleWithLinks := models.ModuleWithLinks{
		Module: *module,
		Links:  links,
	}

	SuccessResponse(c, http.StatusOK, "Module retrieved successfully", moduleWithLinks)
}

// UpdateModule updates an existing module
// @Summary Update module
// @Description Update an existing module
// @Tags modules
// @Accept json
// @Produce json
// @Param courseId path string true "Course ID"
// @Param moduleId path string true "Module ID"
// @Param request body models.UpdateModuleRequest true "Module update request"
// @Success 200 {object} models.APIResponse{data=models.CourseModule} "Module updated successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Module not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{courseId}/modules/{moduleId} [put]
func (h *ModuleHandler) UpdateModule(c *gin.Context) {
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

	moduleIDStr := c.Param("moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid module ID", err)
		return
	}

	var req models.UpdateModuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Verify course ownership
	_, err = h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	module, err := h.db.UpdateModule(moduleID, courseID, &req)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Module not found", err)
			return
		}
		zap.L().Error("Failed to update module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to update module", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Module updated successfully", module)
}

// DeleteModule deletes a module
// @Summary Delete module
// @Description Delete a module and all its links
// @Tags modules
// @Produce json
// @Param courseId path string true "Course ID"
// @Param moduleId path string true "Module ID"
// @Success 200 {object} models.APIResponse "Module deleted successfully"
// @Failure 400 {object} models.APIResponse "Invalid ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Module not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{courseId}/modules/{moduleId} [delete]
func (h *ModuleHandler) DeleteModule(c *gin.Context) {
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

	moduleIDStr := c.Param("moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid module ID", err)
		return
	}

	// Verify course ownership
	_, err = h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	err = h.db.DeleteModule(moduleID, courseID)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Module not found", err)
			return
		}
		zap.L().Error("Failed to delete module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to delete module", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Module deleted successfully", nil)
}

// AddModuleLink adds a link to a module
// @Summary Add link to module
// @Description Add a resource link to a module
// @Tags modules
// @Accept json
// @Produce json
// @Param courseId path string true "Course ID"
// @Param moduleId path string true "Module ID"
// @Param request body models.AddModuleLinkRequest true "Link addition request"
// @Success 201 {object} models.APIResponse{data=models.ModuleLink} "Link added successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Module not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{courseId}/modules/{moduleId}/links [post]
func (h *ModuleHandler) AddModuleLink(c *gin.Context) {
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

	moduleIDStr := c.Param("moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid module ID", err)
		return
	}

	var req models.AddModuleLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Verify course ownership and module existence
	_, err = h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	_, err = h.db.GetModule(moduleID, courseID)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Module not found", err)
			return
		}
		zap.L().Error("Failed to verify module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify module", err)
		return
	}

	link := models.ModuleLink{
		ID:          uuid.New(),
		ModuleID:    moduleID,
		URL:         req.URL,
		Title:       req.Title,
		Description: req.Description,
	}

	if err := h.db.CreateModuleLink(&link); err != nil {
		zap.L().Error("Failed to create module link", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to add link", err)
		return
	}

	SuccessResponse(c, http.StatusCreated, "Link added successfully", link)
}

// DeleteModuleLink deletes a link from a module
// @Summary Delete module link
// @Description Delete a resource link from a module
// @Tags modules
// @Produce json
// @Param courseId path string true "Course ID"
// @Param moduleId path string true "Module ID"
// @Param linkId path string true "Link ID"
// @Success 200 {object} models.APIResponse "Link deleted successfully"
// @Failure 400 {object} models.APIResponse "Invalid ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Link not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/courses/{courseId}/modules/{moduleId}/links/{linkId} [delete]
func (h *ModuleHandler) DeleteModuleLink(c *gin.Context) {
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

	moduleIDStr := c.Param("moduleId")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid module ID", err)
		return
	}

	linkIDStr := c.Param("linkId")
	linkID, err := uuid.Parse(linkIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid link ID", err)
		return
	}

	// Verify course ownership
	_, err = h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	err = h.db.DeleteModuleLink(linkID, moduleID)
	if err != nil {
		if err.Error() == "link not found" {
			ErrorResponse(c, http.StatusNotFound, "Link not found", err)
			return
		}
		zap.L().Error("Failed to delete module link", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to delete link", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Link deleted successfully", nil)
}
