package handlers

import (
	// "net/http"

	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/ai"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/kinyichukwu/edu-pro-backend/pkg/constants"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.uber.org/zap"
)

// QueryHandler handles AI query requests
type QueryHandler struct {
	aiService ai.Service
	validator *validator.Validate
}

// NewQueryHandler creates a new query handler
func NewQueryHandler(aiService ai.Service) *QueryHandler {
	return &QueryHandler{
		aiService: aiService,
		validator: validator.New(),
	}
}

// Query handles the main AI query endpoint
// @Summary Process AI query
// @Description Generate quiz questions or explanations based on the request
// @Tags query
// @Accept json
// @Produce json
// @Param request body models.QueryRequest true "Query request"
// @Success 200 {object} models.APIResponse{data=models.QuizResponse} "Quiz response"
// @Success 200 {object} models.APIResponse{data=models.ExplanationResponse} "Explanation response"
// @Failure 400 {object} models.APIResponse "Bad request"
// @Failure 429 {object} models.APIResponse "Rate limit exceeded"
// @Failure 503 {object} models.APIResponse "AI service unavailable"
// @Router /api/query [post]
func (h *QueryHandler) Query(c *gin.Context) {
	logger := utils.GetLogger()
	requestID, _ := c.Get("request_id")
	
	var req models.QueryRequest
	
	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Failed to bind request",
			zap.String("request_id", requestID.(string)),
			zap.Error(err),
		)
		utils.SendError(c, models.ErrInvalidRequest)
		return
	}
	
	// Validate request
	if err := h.validator.Struct(&req); err != nil {
		validationErrors := h.parseValidationErrors(err)
		logger.Error("Validation failed",
			zap.String("request_id", requestID.(string)),
			zap.Any("errors", validationErrors),
		)
		utils.SendValidationError(c, validationErrors)
		return
	}
	
	// Additional business logic validation
	if !req.IsValid() {
		utils.SendError(c, models.ErrInvalidTask)
		return
	}
	
	// Check query length
	if len(req.Query) < constants.MinQueryLength {
		utils.SendError(c, models.ErrQueryTooShort)
		return
	}
	
	if len(req.Query) > constants.MaxQueryLength {
		utils.SendError(c, models.ErrQueryTooLong)
		return
	}
	
	logger.Info("Processing AI query",
		zap.String("request_id", requestID.(string)),
		zap.String("task", req.Task),
		zap.String("query", req.Query),
		zap.String("subject", req.Subject),
		zap.String("level", req.Level),
	)
	
	// Create AI request
	aiReq := &ai.GeminiRequest{
		Task:    req.Task,
		Query:   req.Query,
		Subject: req.Subject,
		Level:   req.Level,
	}
	
	// Process based on task type
	switch req.Task {
	case constants.TaskQuiz:
		response, err := h.aiService.GenerateQuiz(aiReq)
		if err != nil {
			logger.Error("Failed to generate quiz",
				zap.String("request_id", requestID.(string)),
				zap.Error(err),
			)
			utils.SendError(c, models.ErrAIServiceUnavailable)
			return
		}
		
		utils.SendSuccess(c, response)
		
	case constants.TaskExplain:
		response, err := h.aiService.GenerateExplanation(aiReq)
		if err != nil {
			logger.Error("Failed to generate explanation",
				zap.String("request_id", requestID.(string)),
				zap.Error(err),
			)
			utils.SendError(c, models.ErrAIServiceUnavailable)
			return
		}
		
		utils.SendSuccess(c, response)
		
	default:
		utils.SendError(c, models.ErrInvalidTask)
	}
}

// parseValidationErrors converts validator errors to our custom format
func (h *QueryHandler) parseValidationErrors(err error) *models.ValidationErrors {
	var validationErrors []models.ValidationError
	
	if validatorErrors, ok := err.(validator.ValidationErrors); ok {
		for _, validatorError := range validatorErrors {
			validationError := models.ValidationError{
				Field:   validatorError.Field(),
				Message: h.getValidationMessage(validatorError),
				Value:   validatorError.Value(),
			}
			validationErrors = append(validationErrors, validationError)
		}
	}
	
	return &models.ValidationErrors{
		Errors: validationErrors,
	}
}

// getValidationMessage returns user-friendly validation messages
func (h *QueryHandler) getValidationMessage(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "min":
		return "Value is too short"
	case "max":
		return "Value is too long"
	case "oneof":
		return "Invalid value. Allowed values: " + err.Param()
	default:
		return "Invalid value"
	}
}