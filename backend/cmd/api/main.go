package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/kinyichukwu/edu-pro-backend/internal/config"
	"github.com/kinyichukwu/edu-pro-backend/internal/handlers"
	"github.com/kinyichukwu/edu-pro-backend/internal/middleware"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/ai"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/database"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	if err := utils.InitLogger(cfg.LogLevel); err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}

	logger := utils.GetLogger()
	logger.Info("Starting EDUPRO API",
		zap.String("version", "1.0.0"),
		zap.String("environment", cfg.Environment),
		zap.String("port", cfg.Port),
	)

	// Set Gin mode
	gin.SetMode(cfg.GinMode)

	// Initialize services
	aiService := ai.NewClient(cfg.GeminiAPIKey)
	
	// Initialize database
	dbClient, err := database.NewClient(cfg)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}
	defer dbClient.Close()

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler(aiService)
	queryHandler := handlers.NewQueryHandler(aiService)
	authHandler := handlers.NewAuthHandler(dbClient, cfg)
	userHandler := handlers.NewUserHandler(dbClient)

	// Setup router
	router := setupRouter(cfg, healthHandler, queryHandler, authHandler, userHandler)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("Server starting", zap.String("address", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}

func setupRouter(cfg *config.Config, healthHandler *handlers.HealthHandler, queryHandler *handlers.QueryHandler, authHandler *handlers.AuthHandler, userHandler *handlers.UserHandler) *gin.Engine {
	router := gin.New()

	// Setup middleware
	handlers.SetupMiddleware(router, cfg)

	// Health endpoints
	router.GET("/health", healthHandler.Health)
	router.GET("/ready", healthHandler.Ready)
	router.GET("/version", healthHandler.Version)

	// API routes
	api := router.Group("/api")
	{
		// Public routes
		api.GET("/tasks", healthHandler.GetTasks)
		api.POST("/query", queryHandler.Query)

		// Auth routes (protected)
		auth := api.Group("/auth")
		auth.Use(middleware.JWTMiddleware(cfg))
		{
			auth.GET("/me", authHandler.Me)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// User routes (protected)
		user := api.Group("/user")
		user.Use(middleware.JWTMiddleware(cfg))
		{
			user.GET("/onboarding", userHandler.GetOnboarding)
			user.PUT("/onboarding", userHandler.UpdateOnboarding)
			user.PUT("/profile", userHandler.UpdateProfile)
		}

		// Internal routes (for integration)
		internal := api.Group("/internal")
		{
			internal.POST("/users", authHandler.CreateUser)
		}
	}

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "EDUPRO API v1.0.0",
			"status":  "running",
			"docs":    "/api/tasks",
		})
	})

	return router
}