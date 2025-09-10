package handlers

import (
	// "net/http"
	"time"

	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/ai"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"github.com/kinyichukwu/edu-pro-backend/pkg/constants"

	"github.com/gin-gonic/gin"
)

var startTime = time.Now()

// HealthHandler handles health check requests
type HealthHandler struct {
	aiService ai.Service
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(aiService ai.Service) *HealthHandler {
	return &HealthHandler{
		aiService: aiService,
	}
}

// Health returns the health status of the application
// @Summary Health check
// @Description Get the health status of the API
// @Tags health
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.HealthResponse}
// @Router /health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	uptime := time.Since(startTime)
	
	healthData := models.HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Version:   "1.0.0",
		Uptime:    uptime.String(),
	}
	
	// Check AI service health (optional - don't fail health check if AI is down)
	if !h.aiService.IsHealthy() {
		healthData.Status = "degraded"
	}
	
	utils.SendSuccess(c, healthData)
}

// Ready returns readiness status (more strict than health)
// @Summary Readiness check
// @Description Check if the API is ready to serve requests
// @Tags health
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.HealthResponse}
// @Failure 503 {object} models.APIResponse
// @Router /ready [get]
func (h *HealthHandler) Ready(c *gin.Context) {
	// Check if AI service is available
	if !h.aiService.IsHealthy() {
		utils.SendError(c, models.ErrAIServiceUnavailable)
		return
	}
	
	uptime := time.Since(startTime)
	
	readyData := models.HealthResponse{
		Status:    "ready",
		Timestamp: time.Now(),
		Version:   "1.0.0",
		Uptime:    uptime.String(),
	}
	
	utils.SendSuccess(c, readyData)
}

// GetTasks returns available task types
// @Summary Get available tasks
// @Description Get list of available task types
// @Tags tasks
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.TasksResponse}
// @Router /api/tasks [get]
func (h *HealthHandler) GetTasks(c *gin.Context) {
	tasks := models.TasksResponse{
		Tasks: []models.TaskInfo{
			{
				Name:        constants.TaskQuiz,
				Description: "Generate multiple-choice quiz questions on any topic",
				Example:     "Generate a quiz about photosynthesis for WAEC Biology",
			},
			{
				Name:        constants.TaskExplain,
				Description: "Provide detailed explanations of concepts and topics",
				Example:     "Explain the process of cellular respiration in simple terms",
			},
		},
	}
	
	utils.SendSuccess(c, tasks)
}

// Version returns API version information
// @Summary Get API version
// @Description Get version and build information
// @Tags info
// @Produce json
// @Success 200 {object} models.APIResponse
// @Router /version [get]
func (h *HealthHandler) Version(c *gin.Context) {
	versionData := map[string]interface{}{
		"version":    "1.0.0",
		"build_time": "2025-06-22",
		"go_version": "1.22",
		"git_commit": "latest",
	}
	
	utils.SendSuccess(c, versionData)
}