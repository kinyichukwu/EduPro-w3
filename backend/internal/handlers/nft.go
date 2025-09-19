package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kinyichukwu/edu-pro-backend/internal/models"
	"github.com/kinyichukwu/edu-pro-backend/internal/services/nft"
	"github.com/kinyichukwu/edu-pro-backend/internal/utils"
	"go.uber.org/zap"
)

// NFTHandler handles NFT-related HTTP requests
type NFTHandler struct {
	nftService *nft.Service
	logger     *zap.Logger
}

// NewNFTHandler creates a new NFT handler
func NewNFTHandler(nftService *nft.Service) *NFTHandler {
	return &NFTHandler{
		nftService: nftService,
		logger:     utils.GetLogger(),
	}
}

// CreateMembershipNFT creates a membership NFT for a new user
// @Summary Create membership NFT
// @Description Creates a membership NFT for a new user who has connected and verified their wallet
// @Tags NFT
// @Accept json
// @Produce json
// @Param request body models.CreateMembershipNFTRequest true "Membership NFT creation request"
// @Success 201 {object} models.CreateMembershipNFTResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/membership [post]
func (h *NFTHandler) CreateMembershipNFT(c *gin.Context) {
	var req models.CreateMembershipNFTRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to decode request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(req); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create membership NFT
	response, err := h.nftService.CreateMembershipNFT(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to create membership NFT", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// CreateCourseNFTCollection creates a course NFT collection for a creator
// @Summary Create course NFT collection
// @Description Creates a course NFT collection that can be used to gain access to a course
// @Tags NFT
// @Accept json
// @Produce json
// @Param request body models.CreateCourseNFTCollectionRequest true "Course NFT collection creation request"
// @Success 201 {object} models.CreateCourseNFTCollectionResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/course-collection [post]
func (h *NFTHandler) CreateCourseNFTCollection(c *gin.Context) {
	var req models.CreateCourseNFTCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to decode request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(req); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create course NFT collection
	response, err := h.nftService.CreateCourseNFTCollection(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to create course NFT collection", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// PurchaseCourseNFT purchases a course NFT using EduPro tokens
// @Summary Purchase course NFT
// @Description Purchases a course NFT using EduPro tokens
// @Tags NFT
// @Accept json
// @Produce json
// @Param request body models.PurchaseCourseNFTRequest true "Course NFT purchase request"
// @Success 201 {object} models.PurchaseCourseNFTResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/course/purchase [post]
func (h *NFTHandler) PurchaseCourseNFT(c *gin.Context) {
	var req models.PurchaseCourseNFTRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to decode request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(req); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Purchase course NFT
	response, err := h.nftService.PurchaseCourseNFT(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to purchase course NFT", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// GetUserNFTs retrieves all NFTs owned by a user
// @Summary Get user NFTs
// @Description Retrieves all NFTs (membership and course) owned by a user
// @Tags NFT
// @Accept json
// @Produce json
// @Param request body models.GetUserNFTsRequest true "Get user NFTs request"
// @Success 200 {object} models.GetUserNFTsResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/user [post]
func (h *NFTHandler) GetUserNFTs(c *gin.Context) {
	var req models.GetUserNFTsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to decode request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(req); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user NFTs
	response, err := h.nftService.GetUserNFTs(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to get user NFTs", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetCourseNFTCollection retrieves course NFT collection details
// @Summary Get course NFT collection
// @Description Retrieves details about a course NFT collection including available and owned NFTs
// @Tags NFT
// @Accept json
// @Produce json
// @Param request body models.GetCourseNFTCollectionRequest true "Get course NFT collection request"
// @Success 200 {object} models.GetCourseNFTCollectionResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/course-collection/details [post]
func (h *NFTHandler) GetCourseNFTCollection(c *gin.Context) {
	var req models.GetCourseNFTCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to decode request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(req); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get course NFT collection
	response, err := h.nftService.GetCourseNFTCollection(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to get course NFT collection", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetUserNFTsByEmail retrieves all NFTs owned by a user by email (GET endpoint)
// @Summary Get user NFTs by email
// @Description Retrieves all NFTs owned by a user using their email address
// @Tags NFT
// @Produce json
// @Param email query string true "User email address"
// @Param type query string false "NFT type filter (membership or course)"
// @Success 200 {object} models.GetUserNFTsResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/user/{email} [get]
func (h *NFTHandler) GetUserNFTsByEmail(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email parameter is required"})
		return
	}

	nftTypeStr := c.Query("type")
	var nftType *models.NFTType
	if nftTypeStr != "" {
		nt := models.NFTType(nftTypeStr)
		nftType = &nt
	}

	req := &models.GetUserNFTsRequest{
		UserEmail: email,
		NFTType:   nftType,
	}

	// Get user NFTs
	response, err := h.nftService.GetUserNFTs(c.Request.Context(), req)
	if err != nil {
		h.logger.Error("Failed to get user NFTs", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetCourseNFTCollectionByID retrieves course NFT collection details by ID (GET endpoint)
// @Summary Get course NFT collection by ID
// @Description Retrieves details about a course NFT collection using its ID
// @Tags NFT
// @Produce json
// @Param id path string true "Collection ID"
// @Success 200 {object} models.GetCourseNFTCollectionResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/course-collection/{id} [get]
func (h *NFTHandler) GetCourseNFTCollectionByID(c *gin.Context) {
	collectionIDStr := c.Param("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid collection ID"})
		return
	}

	req := &models.GetCourseNFTCollectionRequest{
		CollectionID: collectionID,
	}

	// Get course NFT collection
	response, err := h.nftService.GetCourseNFTCollection(c.Request.Context(), req)
	if err != nil {
		h.logger.Error("Failed to get course NFT collection", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// TransferNFT transfers an NFT to another user
// @Summary Transfer NFT
// @Description Transfers an NFT from one user to another
// @Tags NFT
// @Accept json
// @Produce json
// @Param request body models.TransferNFTRequest true "NFT transfer request"
// @Success 200 {object} models.TransferNFTResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /api/nft/transfer [post]
func (h *NFTHandler) TransferNFT(c *gin.Context) {
	var req models.TransferNFTRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Failed to decode request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate request
	if err := utils.ValidateStruct(req); err != nil {
		h.logger.Error("Validation failed", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement NFT transfer functionality
	// For now, return a placeholder response
	response := &models.TransferNFTResponse{
		NFTMintAddress:       req.NFTMintAddress,
		FromEmail:            req.FromEmail,
		ToEmail:              req.ToEmail,
		ToWalletAddress:      req.ToWalletAddress,
		TransactionSignature: "placeholder_signature",
		Status:               models.NFTStatusPending,
		Message:              "NFT transfer functionality will be implemented in the next phase",
	}

	c.JSON(http.StatusOK, response)
}
