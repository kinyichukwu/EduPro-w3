package utils

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.Logger

// InitLogger initializes the global logger
func InitLogger(level string) error {
	var config zap.Config

	if os.Getenv("ENVIRONMENT") == "development" {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		config.EncoderConfig.TimeKey = ""
	} else {
		config = zap.NewProductionConfig()
		config.EncoderConfig.TimeKey = ""
	}

	// Set log level
	switch level {
	case "debug":
		config.Level.SetLevel(zapcore.DebugLevel)
	case "info":
		config.Level.SetLevel(zapcore.InfoLevel)
	case "warn":
		config.Level.SetLevel(zapcore.WarnLevel)
	case "error":
		config.Level.SetLevel(zapcore.ErrorLevel)
	default:
		config.Level.SetLevel(zapcore.InfoLevel)
	}

	var err error
	Logger, err = config.Build()
	if err != nil {
		return err
	}

	return nil
}

// GetLogger returns the global logger instance
func GetLogger() *zap.Logger {
	if Logger == nil {
		// Fallback to nop logger if not initialized
		Logger = zap.NewNop()
	}
	return Logger
}