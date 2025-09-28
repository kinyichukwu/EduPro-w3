package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	GinMode        string
	Environment    string
	GeminiAPIKey   string
	AllowedOrigins []string
	LogLevel       string
	RateLimit      int
	// Supabase Configuration
	SupabaseURL       string
	SupabaseKey       string
	SupabaseJWTSecret string
	DatabaseURL       string
	// RAG Configuration
	BucketName string
	// Solana Configuration
	SolanaConfig              *SolanaConfig
	SolanaRPCURL              string
	EduProMintAddress         string
	EduProMintAuthoritySecret string
	EduProPlatformFeeBPS      int
	EduProJupiterAPIBase      string
	EduProStakingProgramID    string
	EduProStakingTreasury     string
	CourseCreationFeeEDU      int
	// Pinata IPFS Configuration
	PinataAPIKey     string
	PinataAPISecret  string
	PinataJWT        string
	PinataGatewayURL string
}

func Load() (*Config, error) {
	// Load .env file if it exists (optional for production)
	_ = godotenv.Load()

	config := &Config{
		Port:              getEnv("PORT", "8080"),
		GinMode:           getEnv("GIN_MODE", "release"),
		Environment:       getEnv("ENVIRONMENT", "development"),
		GeminiAPIKey:      getEnv("GEMINI_API_KEY", ""),
		LogLevel:          getEnv("LOG_LEVEL", "info"),
		SupabaseURL:       getEnv("SUPABASE_URL", ""),
		SupabaseKey:       getEnv("SUPABASE_KEY", ""),
		SupabaseJWTSecret: getEnv("SUPABASE_JWT_SECRET", ""),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		BucketName:        getEnv("BUCKET_NAME", "documents"),
		SolanaConfig:      NewSolanaConfig(),
		// Solana Configuration
		SolanaRPCURL:              getEnv("SOLANA_RPC_URL", getEnv("SOLANA_RPC_ENDPOINT", "https://api.devnet.solana.com")),
		EduProMintAddress:         getEnv("EDUPRO_MINT_ADDRESS", ""),
		EduProMintAuthoritySecret: getEnv("EDUPRO_MINT_AUTHORITY_SECRET_BASE58", ""),
		EduProJupiterAPIBase:      getEnv("EDUPRO_JUPITER_API_BASE", "https://quote-api.jup.ag/v6"),
		EduProStakingProgramID:    getEnv("EDUPRO_STAKING_PROGRAM_ID", ""),
		EduProStakingTreasury:     getEnv("EDUPRO_STAKING_TREASURY", ""),
	}

	// Parse allowed origins
	origins := getEnv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173")
	config.AllowedOrigins = strings.Split(origins, ",")
	for i := range config.AllowedOrigins {
		config.AllowedOrigins[i] = strings.TrimSpace(config.AllowedOrigins[i])
	}

	// Parse rate limit
	rateLimitStr := getEnv("RATE_LIMIT", "100")
	rateLimit, err := strconv.Atoi(rateLimitStr)
	if err != nil {
		rateLimit = 100
	}
	config.RateLimit = rateLimit

	// Parse platform fee BPS
	platformFeeBPSStr := getEnv("EDUPRO_PLATFORM_FEE_BPS", "250") // 2.5% default
	platformFeeBPS, err := strconv.Atoi(platformFeeBPSStr)
	if err != nil {
		platformFeeBPS = 250
	}
	config.EduProPlatformFeeBPS = platformFeeBPS

	// Parse course creation fee
	courseCreationFeeStr := getEnv("COURSE_CREATION_FEE_EDU", "10") // 10 EDU tokens default
	courseCreationFee, err := strconv.Atoi(courseCreationFeeStr)
	if err != nil {
		courseCreationFee = 10
	}
	config.CourseCreationFeeEDU = courseCreationFee

	// Load Pinata IPFS configuration
	config.PinataAPIKey = getEnv("PINATA_API_KEY", "5b3b02dc2a0e64fcb0b6")
	config.PinataAPISecret = getEnv("PINATA_API_SECRET", "5fda3f351019dd61d9354100fa53882a97c68c46368b1b221ac5008d3ea2186e")
	config.PinataJWT = getEnv("PINATA_JWT", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyMzMyMjU4YS1iYjY5LTQ1ZTItOGQ4Yy04NTdkZmM5NmQ2N2IiLCJlbWFpbCI6ImtpbnlpY2h1a3d1b3NlQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1YjNiMDJkYzJhMGU2NGZjYjBiNiIsInNjb3BlZEtleVNlY3JldCI6IjVmZGEzZjM1MTAxOWRkNjFkOTM1NDEwMGZhNTM4ODJhOTdjNjhjNDYzNjhiMWIyMjFhYzUwMDhkM2VhMjE4NmUiLCJleHAiOjE3OTA2MDcwNzd9.kycNEirra1xB_YmKX_poveZQSTx2DklgT0GTs3Uh8Ak")
	config.PinataGatewayURL = getEnv("PINATA_GATEWAY_URL", "https://gateway.pinata.cloud")

	// Validate required fields
	if config.GeminiAPIKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is required")
	}
	if config.SupabaseURL == "" {
		return nil, fmt.Errorf("SUPABASE_URL is required")
	}
	if config.SupabaseKey == "" {
		return nil, fmt.Errorf("SUPABASE_KEY is required")
	}
	if config.SupabaseJWTSecret == "" {
		return nil, fmt.Errorf("SUPABASE_JWT_SECRET is required")
	}
	if config.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
