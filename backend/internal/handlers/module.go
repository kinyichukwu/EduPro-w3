package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/ai"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/embeddings"
	"go.uber.org/zap"
)

// ModuleHandler handles course module-related requests
type ModuleHandler struct {
	db         *database.Client
	pgx        *database.PgxClient
	aiClient   ai.Service
	embeddings *embeddings.Client
	validator  *validator.Validate
}

// NewModuleHandler creates a new module handler
func NewModuleHandler(db *database.Client, pgx *database.PgxClient, aiClient ai.Service, embeddings *embeddings.Client) *ModuleHandler {
	return &ModuleHandler{
		db:         db,
		pgx:        pgx,
		aiClient:   aiClient,
		embeddings: embeddings,
		validator:  validator.New(),
	}
}

// GenerateModuleTitle generates a module title using AI
// @Summary Generate module title with AI
// @Description Generate a module title based on course context and description
// @Tags modules
// @Accept json
// @Produce json
// @Param courseId path string true "Course ID"
// @Param request body models.GenerateContentRequest true "Generation request"
// @Success 200 {object} models.GenerateContentResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/courses/{courseId}/modules/generate-title [post]
func (h *ModuleHandler) GenerateModuleTitle(c *gin.Context) {
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

	var req models.GenerateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Verify course ownership
	course, err := h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	if h.aiClient == nil {
		ErrorResponse(c, http.StatusServiceUnavailable, "AI service not available", nil)
		return
	}

	// Build context from existing modules and RAG
	ctx := context.Background()
	courseContext, err := h.buildCourseContext(ctx, courseID, user.ID)
	if err != nil {
		zap.L().Warn("Failed to build course context", zap.Error(err))
		courseContext = ""
	}

	ragContext, err := h.buildRAGContext(ctx, req.Prompt, user.ID)
	if err != nil {
		zap.L().Warn("Failed to build RAG context", zap.Error(err))
		ragContext = ""
	}

	// Build comprehensive prompt with context
	var promptBuilder strings.Builder
	promptBuilder.WriteString(fmt.Sprintf("Generate a clear, engaging module title for a course about '%s'.\n\n", course.Title))
	
	if courseContext != "" {
		promptBuilder.WriteString(courseContext)
		promptBuilder.WriteString("\n\n")
	}
	
	if ragContext != "" {
		promptBuilder.WriteString(ragContext)
		promptBuilder.WriteString("\n\n")
	}
	
	promptBuilder.WriteString(fmt.Sprintf("New module requirement: %s\n\n", req.Prompt))
	promptBuilder.WriteString("Generate an appropriate module title and description that:\n")
	promptBuilder.WriteString("1. Fits logically with existing modules\n")
	promptBuilder.WriteString("2. Uses appropriate numbering/sequencing\n")
	promptBuilder.WriteString("3. Is clear and engaging\n")
	promptBuilder.WriteString("4. Follows educational best practices\n\n")
	promptBuilder.WriteString("Return the response in this exact format:\n")
	promptBuilder.WriteString("Title: [module title]\n")
	promptBuilder.WriteString("Description: [brief description of what this module covers]")

	generatedTitle, err := h.aiClient.GenerateContent(promptBuilder.String())
	if err != nil {
		zap.L().Error("Failed to generate module title", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to generate title", err)
		return
	}

	// Clean up the response (remove quotes, extra whitespace)
	generatedContent := strings.TrimSpace(generatedTitle)

	response := models.GenerateContentResponse{
		Content: generatedContent,
	}

	SuccessResponse(c, http.StatusOK, "Module title and description generated successfully", response)
}

// GenerateModuleContent generates module content using AI
// @Summary Generate module content with AI
// @Description Generate educational content for a module
// @Tags modules
// @Accept json
// @Produce json
// @Param courseId path string true "Course ID"
// @Param request body models.GenerateContentRequest true "Generation request"
// @Success 200 {object} models.GenerateContentResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/courses/{courseId}/modules/generate-content [post]
func (h *ModuleHandler) GenerateModuleContent(c *gin.Context) {
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

	var req models.GenerateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
		return
	}

	// Verify course ownership
	course, err := h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	if h.aiClient == nil {
		ErrorResponse(c, http.StatusServiceUnavailable, "AI service not available", nil)
		return
	}

	// Build context from existing modules and RAG
	ctx := context.Background()
	courseContext, err := h.buildCourseContext(ctx, courseID, user.ID)
	if err != nil {
		zap.L().Warn("Failed to build course context", zap.Error(err))
		courseContext = ""
	}

	ragContext, err := h.buildRAGContext(ctx, req.Prompt, user.ID)
	if err != nil {
		zap.L().Warn("Failed to build RAG context", zap.Error(err))
		ragContext = ""
	}

	// Build comprehensive prompt with context
	var promptBuilder strings.Builder
	promptBuilder.WriteString(fmt.Sprintf("Create comprehensive educational content for a module in a course about '%s'.\n\n", course.Title))
	
	if courseContext != "" {
		promptBuilder.WriteString(courseContext)
		promptBuilder.WriteString("\n\n")
	}
	
	if ragContext != "" {
		promptBuilder.WriteString(ragContext)
		promptBuilder.WriteString("\n\n")
	}
	
	promptBuilder.WriteString(fmt.Sprintf("New module requirement: %s\n\n", req.Prompt))
	promptBuilder.WriteString("Generate comprehensive module content that:\n")
	promptBuilder.WriteString("1. Builds logically on existing modules\n")
	promptBuilder.WriteString("2. Maintains consistency with course structure\n")
	promptBuilder.WriteString("3. Uses appropriate educational progression\n")
	promptBuilder.WriteString("4. Includes explanations, examples, and key concepts\n")
	promptBuilder.WriteString("5. Is well-structured and engaging\n")
	promptBuilder.WriteString("6. References relevant course materials when appropriate\n\n")
	promptBuilder.WriteString("Format the content in markdown for better readability. Include headers, bullet points, and code examples where relevant.")

	generatedContent, err := h.aiClient.GenerateContent(promptBuilder.String())
	if err != nil {
		zap.L().Error("Failed to generate module content", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to generate content", err)
		return
	}

	response := models.GenerateContentResponse{
		Content: generatedContent,
	}

	SuccessResponse(c, http.StatusOK, "Module content generated successfully", response)
}

// buildCourseContext creates context from existing modules for AI generation
func (h *ModuleHandler) buildCourseContext(ctx context.Context, courseID uuid.UUID, userID uuid.UUID) (string, error) {
	// Get existing modules for the course
	modules, err := h.db.GetCourseModules(courseID)
	if err != nil {
		return "", fmt.Errorf("failed to get existing modules: %w", err)
	}

	if len(modules) == 0 {
		return "", nil // No existing modules
	}

	var contextBuilder strings.Builder
	contextBuilder.WriteString("Existing course modules:\n\n")

	for i, module := range modules {
		contextBuilder.WriteString(fmt.Sprintf("%d. %s\n", module.OrderIndex, module.Title))
		if module.Description != "" {
			contextBuilder.WriteString(fmt.Sprintf("   Description: %s\n", module.Description))
		}
		if module.Content != "" {
			// Truncate content to avoid overly long context
			content := module.Content
			if len(content) > 500 {
				content = content[:500] + "..."
			}
			contextBuilder.WriteString(fmt.Sprintf("   Content preview: %s\n", content))
		}
		if i < len(modules)-1 {
			contextBuilder.WriteString("\n")
		}
	}

	return contextBuilder.String(), nil
}

// buildRAGContext searches for relevant content using embeddings
func (h *ModuleHandler) buildRAGContext(ctx context.Context, query string, userID uuid.UUID) (string, error) {
	if h.embeddings == nil {
		return "", nil // No embeddings service available
	}

	// Generate embedding for the query
	queryEmbedding, err := h.embeddings.GenerateEmbedding(query)
	if err != nil {
		zap.L().Warn("Failed to generate embedding for query", zap.Error(err))
		return "", nil // Degrade gracefully
	}

	// Search for similar chunks in user's documents
	chunks, err := h.pgx.SearchSimilarChunks(ctx, queryEmbedding, userID.String(), 5)
	if err != nil {
		zap.L().Warn("Failed to search similar chunks", zap.Error(err))
		return "", nil // Degrade gracefully
	}

	if len(chunks) == 0 {
		return "", nil
	}

	var contextBuilder strings.Builder
	contextBuilder.WriteString("Relevant course materials:\n\n")

	for i, chunk := range chunks {
		contextBuilder.WriteString(fmt.Sprintf("Document: %s\n", chunk.DocumentTitle))
		if chunk.SourceURL != nil && *chunk.SourceURL != "" {
			contextBuilder.WriteString(fmt.Sprintf("Source: %s\n", *chunk.SourceURL))
		}
		contextBuilder.WriteString(fmt.Sprintf("Content: %s\n", chunk.Content))
		if i < len(chunks)-1 {
			contextBuilder.WriteString("\n---\n\n")
		}
	}

	return contextBuilder.String(), nil
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
	course, err := h.db.GetCourse(courseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	// If AI generation is requested and we have a prompt, generate content
	if req.UseAI && req.AIPrompt != "" && h.aiClient != nil {
		// Generate AI content
		prompt := fmt.Sprintf("Create educational content for a module titled '%s' in a course about '%s'. The module should cover: %s. Provide comprehensive, well-structured content suitable for learning.", req.Title, course.Title, req.AIPrompt)
		
		aiResponse, err := h.aiClient.GenerateContent(prompt)
		if err != nil {
			zap.L().Error("Failed to generate AI content", zap.Error(err))
			// Continue without AI content rather than failing
		} else {
			req.Content = aiResponse
		}
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

// UpdateChapter updates a full chapter/module by ID
// @Summary Update full chapter
// @Description Update a full chapter/module by its ID
// @Tags chapters
// @Accept json
// @Produce json
// @Param id path string true "Chapter/Module ID"
// @Param request body models.UpdateModuleRequest true "Chapter update request"
// @Success 200 {object} models.APIResponse{data=models.CourseModule} "Chapter updated successfully"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Chapter not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/chapters/{id} [put]
func (h *ModuleHandler) UpdateChapter(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	moduleIDStr := c.Param("id")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid chapter ID", err)
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

	// Get module to find course and verify ownership
	module, err := h.db.GetModuleByID(moduleID)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Chapter not found", err)
			return
		}
		zap.L().Error("Failed to get module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve chapter", err)
		return
	}

	// Verify course ownership
	_, err = h.db.GetCourse(module.CourseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found or access denied", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	updatedModule, err := h.db.UpdateModule(moduleID, module.CourseID, &req)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Chapter not found", err)
			return
		}
		zap.L().Error("Failed to update module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to update chapter", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Chapter updated successfully", updatedModule)
}

// DeleteChapter deletes a chapter/module by ID
// @Summary Delete chapter
// @Description Delete a chapter/module by its ID
// @Tags chapters
// @Produce json
// @Param id path string true "Chapter/Module ID"
// @Success 200 {object} models.APIResponse "Chapter deleted successfully"
// @Failure 400 {object} models.APIResponse "Invalid chapter ID"
// @Failure 401 {object} models.APIResponse "Unauthorized"
// @Failure 404 {object} models.APIResponse "Chapter not found"
// @Failure 500 {object} models.APIResponse "Internal server error"
// @Router /api/chapters/{id} [delete]
func (h *ModuleHandler) DeleteChapter(c *gin.Context) {
	user, err := h.getUserFromContext(c)
	if err != nil {
		ErrorResponse(c, http.StatusUnauthorized, err.Error(), err)
		return
	}

	moduleIDStr := c.Param("id")
	moduleID, err := uuid.Parse(moduleIDStr)
	if err != nil {
		ErrorResponse(c, http.StatusBadRequest, "Invalid chapter ID", err)
		return
	}

	// Get module to find course and verify ownership
	module, err := h.db.GetModuleByID(moduleID)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Chapter not found", err)
			return
		}
		zap.L().Error("Failed to get module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to retrieve chapter", err)
		return
	}

	// Verify course ownership
	_, err = h.db.GetCourse(module.CourseID, user.ID)
	if err != nil {
		if err.Error() == "course not found" {
			ErrorResponse(c, http.StatusNotFound, "Course not found or access denied", err)
			return
		}
		zap.L().Error("Failed to verify course ownership", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to verify course", err)
		return
	}

	err = h.db.DeleteModule(moduleID, module.CourseID)
	if err != nil {
		if err.Error() == "module not found" {
			ErrorResponse(c, http.StatusNotFound, "Chapter not found", err)
			return
		}
		zap.L().Error("Failed to delete module", zap.Error(err))
		ErrorResponse(c, http.StatusInternalServerError, "Failed to delete chapter", err)
		return
	}

	SuccessResponse(c, http.StatusOK, "Chapter deleted successfully", nil)
}
