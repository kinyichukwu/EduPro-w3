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
	}

	// Parse allowed origins
	origins := getEnv("ALLOWED_ORIGINS", "http://localhost:3000")
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