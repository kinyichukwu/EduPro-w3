package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
)

// ErrorResponse sends an error response using the utils package
func ErrorResponse(c *gin.Context, statusCode int, message string, err error) {
	apiError := &models.APIError{
		Code:    statusCode,
		Message: message,
	}
	if err != nil {
		apiError.Details = err.Error()
	}
	utils.SendError(c, apiError)
}

// SuccessResponse sends a success response using the utils package
func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	// For now, we'll use the SendSuccess function and ignore the message
	// since the current utils.SendSuccess doesn't support custom messages
	c.JSON(statusCode, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}
