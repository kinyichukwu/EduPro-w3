package utils

import (
	"net/http"
	"time"

	"github.com/kinyichukwu/edu-pro-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// SendSuccess sends a successful response
func SendSuccess(c *gin.Context, data interface{}) {
	requestID := getRequestID(c)
	processingTime := getProcessingTime(c)

	response := models.APIResponse{
		Success:   true,
		Data:      data,
		Timestamp: time.Now(),
		Meta: &models.Meta{
			RequestID:      requestID,
			ProcessingTime: processingTime,
			Version:        "1.0.0",
		},
	}

	c.JSON(http.StatusOK, response)
}

// SendError sends an error response
func SendError(c *gin.Context, err *models.APIError) {
	requestID := getRequestID(c)
	processingTime := getProcessingTime(c)

	response := models.APIResponse{
		Success:   false,
		Error:     err.Message,
		Timestamp: time.Now(),
		Meta: &models.Meta{
			RequestID:      requestID,
			ProcessingTime: processingTime,
			Version:        "1.0.0",
		},
	}

	// Log the error
	GetLogger().Error("API Error",
		zap.String("request_id", requestID),
		zap.Int("status_code", err.Code),
		zap.String("error", err.Message),
		zap.String("details", err.Details),
	)

	c.JSON(err.Code, response)
}

// SendValidationError sends a validation error response
func SendValidationError(c *gin.Context, validationErrors *models.ValidationErrors) {
	requestID := getRequestID(c)
	processingTime := getProcessingTime(c)

	response := models.APIResponse{
		Success:   false,
		Error:     "Validation failed",
		Data:      validationErrors,
		Timestamp: time.Now(),
		Meta: &models.Meta{
			RequestID:      requestID,
			ProcessingTime: processingTime,
			Version:        "1.0.0",
		},
	}

	c.JSON(http.StatusBadRequest, response)
}

// getRequestID retrieves or generates a request ID
func getRequestID(c *gin.Context) string {
	if requestID, exists := c.Get("request_id"); exists {
		return requestID.(string)
	}
	return uuid.New().String()
}

// getProcessingTime calculates request processing time
func getProcessingTime(c *gin.Context) float64 {
	if startTime, exists := c.Get("start_time"); exists {
		return float64(time.Since(startTime.(time.Time)).Nanoseconds()) / 1e6
	}
	return 0
}