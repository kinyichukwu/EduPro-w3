package handlers

import (
	"net/http"
	"time"

	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// SetupMiddleware configures all middleware for the application
func SetupMiddleware(router *gin.Engine, cfg *config.Config) {
	// Request ID middleware
	router.Use(RequestIDMiddleware())
	
	// Timing middleware
	router.Use(TimingMiddleware())
	
	// Logging middleware
	router.Use(LoggingMiddleware())
	
	// CORS middleware
	router.Use(CORSMiddleware(cfg.AllowedOrigins))
	
	// Recovery middleware
	router.Use(RecoveryMiddleware())
	
	// Rate limiting middleware (basic implementation)
	router.Use(RateLimitMiddleware(cfg.RateLimit))
}

// RequestIDMiddleware adds a unique request ID to each request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// TimingMiddleware tracks request processing time
func TimingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		c.Set("start_time", startTime)
		
		c.Next()
		
		duration := time.Since(startTime)
		c.Header("X-Response-Time", duration.String())
	}
}

// LoggingMiddleware logs all requests
func LoggingMiddleware() gin.HandlerFunc {
	logger := utils.GetLogger()
	
	return func(c *gin.Context) {
		startTime := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery
		
		c.Next()
		
		duration := time.Since(startTime)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		bodySize := c.Writer.Size()
		requestID, _ := c.Get("request_id")
		
		if raw != "" {
			path = path + "?" + raw
		}
		
		logger.Info("HTTP Request",
			zap.String("request_id", requestID.(string)),
			zap.String("client_ip", clientIP),
			zap.String("method", method),
			zap.String("path", path),
			zap.Int("status_code", statusCode),
			zap.Int("body_size", bodySize),
			zap.Duration("duration", duration),
		)
	}
}

// CORSMiddleware configures CORS
func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	config := cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Request-ID"},
		ExposeHeaders:    []string{"X-Request-ID", "X-Response-Time"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	
	return cors.New(config)
}

// RecoveryMiddleware handles panics gracefully
func RecoveryMiddleware() gin.HandlerFunc {
	logger := utils.GetLogger()
	
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				requestID, _ := c.Get("request_id")
				
				logger.Error("Panic recovered",
					zap.String("request_id", requestID.(string)),
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
				)
				
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "Internal server error",
					"request_id": requestID,
				})
				
				c.Abort()
			}
		}()
		
		c.Next()
	}
}

// RateLimitMiddleware implements basic rate limiting
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
	// Simple in-memory rate limiter (for production, use Redis)
	clients := make(map[string][]time.Time)
	
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()
		
		// Clean old entries
		if timestamps, exists := clients[clientIP]; exists {
			var validTimestamps []time.Time
			for _, timestamp := range timestamps {
				if now.Sub(timestamp) < time.Minute {
					validTimestamps = append(validTimestamps, timestamp)
				}
			}
			clients[clientIP] = validTimestamps
		}
		
		// Check rate limit
		if len(clients[clientIP]) >= requestsPerMinute {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Rate limit exceeded",
			})
			c.Abort()
			return
		}
		
		// Add current request
		clients[clientIP] = append(clients[clientIP], now)
		
		c.Next()
	}
}