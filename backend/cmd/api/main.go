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
	"github.com/kinyichukwu/edu-pro-backend/internal/services/embeddings"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/nft"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/solana"
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
	embeddingsService := embeddings.NewClient(cfg.GeminiAPIKey)

	// Initialize database
	dbClient, err := database.NewClient(cfg)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}
	defer dbClient.Close()

	// Initialize pgx client for vector operations
	pgxClient, err := database.NewPgxClient(cfg)
	if err != nil {
		logger.Fatal("Failed to initialize pgx client", zap.Error(err))
	}
	defer pgxClient.Close()

	// Initialize Solana service
	solanaService, err := solana.NewService(cfg.SolanaConfig, dbClient)
	if err != nil {
		logger.Fatal("Failed to initialize Solana service", zap.Error(err))
	}

	// Initialize NFT service
	nftService, err := nft.NewService(cfg.SolanaConfig, dbClient, logger)
	if err != nil {
		logger.Fatal("Failed to initialize NFT service", zap.Error(err))
	}

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler(aiService)
	queryHandler := handlers.NewQueryHandler(aiService)
	authHandler := handlers.NewAuthHandler(dbClient, cfg)
	userHandler := handlers.NewUserHandler(dbClient)
	ragHandler, err := handlers.NewRAGHandler(dbClient, pgxClient, cfg, aiService)
	if err != nil {
		logger.Fatal("Failed to initialize RAG handler", zap.Error(err))
	}

	// Initialize Solana handlers
	walletHandler := handlers.NewWalletHandler(solanaService, dbClient, nftService)
	paymentHandler := handlers.NewPaymentHandler(solanaService)
	edupoTokenHandler := handlers.NewEduProTokenHandler(solanaService)
	solanaHandler, err := handlers.NewSolanaHandler(cfg, logger)
	if err != nil {
		logger.Fatal("Failed to initialize Solana handler", zap.Error(err))
	}
	testAuthHandler := handlers.NewTestAuthHandler(cfg)

	// Initialize NFT handler
	nftHandler := handlers.NewNFTHandler(nftService)

	// Initialize flashcard handler
	flashcardHandler := handlers.NewFlashcardHandler(dbClient, aiService)

	// Initialize course and module handlers
	courseHandler := handlers.NewCourseHandler(dbClient, cfg, solanaService, nftService)
	moduleHandler := handlers.NewModuleHandler(dbClient, pgxClient, aiService, embeddingsService)

	// Setup router
	router := setupRouter(cfg, healthHandler, queryHandler, authHandler, userHandler, ragHandler, walletHandler, paymentHandler, nftHandler, flashcardHandler, courseHandler, moduleHandler, edupoTokenHandler, solanaHandler, testAuthHandler)

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

func setupRouter(cfg *config.Config, healthHandler *handlers.HealthHandler, queryHandler *handlers.QueryHandler, authHandler *handlers.AuthHandler, userHandler *handlers.UserHandler, ragHandler *handlers.RAGHandler, walletHandler *handlers.WalletHandler, paymentHandler *handlers.PaymentHandler, nftHandler *handlers.NFTHandler, flashcardHandler *handlers.FlashcardHandler, courseHandler *handlers.CourseHandler, moduleHandler *handlers.ModuleHandler, edupoTokenHandler *handlers.EduProTokenHandler, solanaHandler *handlers.SolanaHandler, testAuthHandler *handlers.TestAuthHandler) *gin.Engine {
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

		// Auth routes // TODO: make people to be able to use invalid emals and passwords
		auth := api.Group("/auth")
		{
			// Public auth routes
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)

			// Protected auth routes
			auth.Use(middleware.JWTMiddleware(cfg))
			auth.GET("/me", authHandler.Me)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Test routes (for development only)
		test := api.Group("/test")
		{
			test.POST("/generate-token", testAuthHandler.GenerateTestToken)
		}

		// User routes (protected)
		user := api.Group("/user")
		user.Use(middleware.JWTMiddleware(cfg))
		{
			user.GET("/onboarding", userHandler.GetOnboarding)
			user.PUT("/onboarding", userHandler.UpdateOnboarding)
			user.PUT("/profile", userHandler.UpdateProfile)
		}

		// RAG routes (protected) - Apply JWT middleware individually to avoid CORS conflicts
		api.POST("/upload", middleware.JWTMiddleware(cfg), ragHandler.Upload)
		api.GET("/documents", middleware.JWTMiddleware(cfg), ragHandler.GetDocuments)
		api.DELETE("/documents/:id", middleware.JWTMiddleware(cfg), ragHandler.DeleteDocument)
		api.POST("/documents/:id/reprocess", middleware.JWTMiddleware(cfg), ragHandler.ReprocessDocument)
		api.GET("/documents/:id/chunks", middleware.JWTMiddleware(cfg), ragHandler.GetDocumentChunks)
		api.GET("/chats", middleware.JWTMiddleware(cfg), ragHandler.GetChats)
		api.POST("/chats", middleware.JWTMiddleware(cfg), ragHandler.CreateChat)
		api.GET("/chats/:id", middleware.JWTMiddleware(cfg), ragHandler.GetChatMessages)
		api.DELETE("/chats/:id", middleware.JWTMiddleware(cfg), ragHandler.DeleteChat)
		api.PUT("/chats/:id", middleware.JWTMiddleware(cfg), ragHandler.UpdateChat)
		api.POST("/ask", middleware.JWTMiddleware(cfg), ragHandler.Ask)
		api.GET("/rag/health", middleware.JWTMiddleware(cfg), ragHandler.RAGHealth)

		// Solana Wallet routes (protected)
		wallet := api.Group("/wallet")
		wallet.Use(middleware.JWTMiddleware(cfg))
		{
			wallet.POST("/generate", walletHandler.GenerateWallet)
			wallet.POST("/fund", walletHandler.FundWallet)
			wallet.POST("/connect", walletHandler.ConnectWallet)
			wallet.POST("/verify", walletHandler.VerifyWallet)
			wallet.GET("/list", walletHandler.GetWallets)
			wallet.DELETE("/:id", walletHandler.DisconnectWallet)
		}

		// Solana Payment routes (protected)
		payment := api.Group("/payment")
		payment.Use(middleware.JWTMiddleware(cfg))
		{
			payment.POST("/generate", paymentHandler.GeneratePayment)
			payment.POST("/submit", paymentHandler.SubmitPayment)
			payment.GET("/tokens", paymentHandler.GetSupportedTokens)
			payment.GET("/status/:transactionId", paymentHandler.GetPaymentStatus)
			payment.POST("/deduct", paymentHandler.DeductFromWallet)
			payment.POST("/send-tokens", paymentHandler.SendEduProTokens)
			payment.POST("/query-tokens", paymentHandler.QueryOnChainEduProTokens)
		}

		// EduPro Token routes
		edupoTokens := api.Group("/edupo-tokens")
		{
			// Public endpoint for token info
			edupoTokens.GET("/info", edupoTokenHandler.GetEduProTokenInfo)

			// Protected endpoints
			edupoTokensProtected := edupoTokens.Group("")
			edupoTokensProtected.Use(middleware.JWTMiddleware(cfg))
			{
				edupoTokensProtected.POST("/buy", edupoTokenHandler.BuyEduProTokens)
			}
		}

		// Solana routes (protected)
		solanaRoutes := api.Group("/solana")
		solanaRoutes.Use(middleware.JWTMiddleware(cfg))
		{
			// Wallet balance endpoints
			solanaRoutes.GET("/wallet/:address/balance", solanaHandler.GetWalletBalance)
			solanaRoutes.GET("/wallet/:address/token-balance", solanaHandler.GetTokenBalance)
			solanaRoutes.GET("/wallet/:address/edutoken-balance", solanaHandler.GetEduTokenBalance)

			// Transaction endpoints
			solanaRoutes.GET("/transaction/:signature", solanaHandler.VerifyTransaction)
			solanaRoutes.POST("/transaction/wait/:signature", solanaHandler.WaitForConfirmation)

			// Payment endpoints
			solanaRoutes.POST("/payment/create-url", solanaHandler.CreatePaymentURL)
			solanaRoutes.POST("/payment/process-course", solanaHandler.ProcessCoursePayment)

			// Swap endpoints
			solanaRoutes.POST("/swap/quote", solanaHandler.GetSwapQuote)
			solanaRoutes.POST("/swap/execute", solanaHandler.ExecuteSwap)
			solanaRoutes.POST("/swap/sign", solanaHandler.SignSwapTransaction)
			solanaRoutes.POST("/swap/submit", solanaHandler.SubmitSwapTransaction)
			solanaRoutes.GET("/swap/status/:swapId", solanaHandler.GetSwapStatus)

			// Reward endpoints
			solanaRoutes.POST("/reward/distribute", solanaHandler.DistributeReward)
			solanaRoutes.GET("/reward/calculate", solanaHandler.CalculateReward)

			// Stats endpoints
			solanaRoutes.GET("/stats", solanaHandler.GetBlockchainStats)
		}

		// Admin routes (protected)
		admin := api.Group("/admin")
		admin.Use(middleware.JWTMiddleware(cfg)) // TODO: Add admin-specific middleware
		{
			// Transfer endpoints
			admin.POST("/transfer/edupro", solanaHandler.AdminTransferEduPro)
		}

		// NFT routes (protected)
		nft := api.Group("/nft")
		nft.Use(middleware.JWTMiddleware(cfg))
		{
			// Membership NFT routes
			nft.POST("/membership", nftHandler.CreateMembershipNFT)

			// Course NFT collection routes
			nft.POST("/course-collection", nftHandler.CreateCourseNFTCollection)
			nft.GET("/course-collection/:id", nftHandler.GetCourseNFTCollectionByID)
			nft.POST("/course-collection/details", nftHandler.GetCourseNFTCollection)

			// Course NFT purchase routes
			nft.POST("/course/purchase", nftHandler.PurchaseCourseNFT)

			// User NFT routes
			nft.GET("/user/:email", nftHandler.GetUserNFTsByEmail)
			nft.POST("/user", nftHandler.GetUserNFTs)

			// NFT transfer routes
			nft.POST("/transfer", nftHandler.TransferNFT)
		}

		// Flashcard routes (protected)
		flashcards := api.Group("/flashcards")
		flashcards.Use(middleware.JWTMiddleware(cfg))
		{
			// Deck routes
			flashcards.POST("/decks", flashcardHandler.CreateDeck)
			flashcards.GET("/decks", flashcardHandler.GetDecks)
			flashcards.GET("/decks/:id", flashcardHandler.GetDeck)
			flashcards.PUT("/decks/:id", flashcardHandler.UpdateDeck)
			flashcards.DELETE("/decks/:id", flashcardHandler.DeleteDeck)

			// Card routes - use :id consistently
			flashcards.POST("/decks/:id/cards", flashcardHandler.CreateFlashcard)
			flashcards.POST("/decks/:id/cards/bulk", flashcardHandler.CreateBulkFlashcards)
			flashcards.GET("/decks/:id/cards", flashcardHandler.GetFlashcards)
			flashcards.GET("/decks/:id/cards/study", flashcardHandler.GetStudyCards)
			flashcards.PUT("/decks/:id/cards/:flashcard_id/rate", flashcardHandler.RateFlashcard)
			flashcards.POST("/decks/:id/generate", flashcardHandler.GenerateAIFlashcards)

			// Study session routes
			flashcards.POST("/study/sessions", flashcardHandler.StartStudySession)
			flashcards.PUT("/study/sessions/:sessionId", flashcardHandler.EndStudySession)

			// Statistics routes
			flashcards.GET("/stats", flashcardHandler.GetFlashcardStats)
		}

		// Course routes
		courses := api.Group("/courses")
		{
			// Public browse endpoints
			courses.GET("/browse", courseHandler.BrowseCourses)
			courses.GET("/browse/:id", courseHandler.BrowseCourse)
			courses.GET("/public-with-purchase-info", courseHandler.GetPublicCoursesWithPurchaseInfo)

			// Protected endpoints
			courses.Use(middleware.JWTMiddleware(cfg))
			// Course management
			courses.POST("", courseHandler.CreateCourse)
			courses.POST("/create-with-payment", courseHandler.CreateCourseWithPayment)
			courses.GET("", courseHandler.GetCourses)
			courses.GET("/stats", courseHandler.GetCourseStats)
			courses.GET("/:id", courseHandler.GetCourse)
			courses.GET("/:id/details", courseHandler.GetCourseDetails)
			courses.GET("/:id/content", courseHandler.GetCourseContent)
			courses.PUT("/:id", courseHandler.UpdateCourse)
			courses.DELETE("/:id", courseHandler.DeleteCourse)

			// NFT Purchase endpoints
			courses.POST("/:id/purchase", courseHandler.PurchaseCourse)
			courses.GET("/my-purchases", courseHandler.GetUserPurchasedCourses)

			// Course status and learning endpoints
			courses.PATCH("/:id/status", courseHandler.UpdateCourseStatus)
			courses.GET("/:id/learn", courseHandler.GetCourseLearningContent)
			courses.GET("/:id/progress", courseHandler.GetCourseProgress)
			courses.PATCH("/:id/progress", courseHandler.UpdateCourseProgress)
			courses.POST("/:id/enroll", courseHandler.EnrollCourse)
			courses.GET("/enrolled", courseHandler.GetMyCourses)

			// Module management
			courses.POST("/:id/modules", moduleHandler.CreateModule)
			courses.GET("/:id/modules", moduleHandler.GetModules)
			courses.GET("/:id/modules/:moduleId", moduleHandler.GetModule)
			courses.PUT("/:id/modules/:moduleId", moduleHandler.UpdateModule)
			courses.DELETE("/:id/modules/:moduleId", moduleHandler.DeleteModule)

			// AI content generation
			courses.POST("/:id/modules/generate-title", moduleHandler.GenerateModuleTitle)
			courses.POST("/:id/modules/generate-content", moduleHandler.GenerateModuleContent)

			// Module links management
			courses.POST("/:id/modules/:moduleId/links", moduleHandler.AddModuleLink)
			courses.DELETE("/:id/modules/:moduleId/links/:linkId", moduleHandler.DeleteModuleLink)
		}

		// Chapter routes (protected) - Direct module access
		chapters := api.Group("/chapters")
		chapters.Use(middleware.JWTMiddleware(cfg))
		{
			chapters.PUT("/:id", moduleHandler.UpdateChapter)
			chapters.DELETE("/:id", moduleHandler.DeleteChapter)
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
