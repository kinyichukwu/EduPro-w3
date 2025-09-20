package main

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID string `json:"sub"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func main() {
	// Common test secret - you might need to adjust this based on your actual secret
	secret := "your-supabase-jwt-secret"

	claims := &JWTClaims{
		UserID: "test-user-id-juliusayoola5@gmail.com",
		Email:  "juliusayoola5@gmail.com",
		Role:   "user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "edupro-test",
			Subject:   "test-user-id-juliusayoola5@gmail.com",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}

	fmt.Printf("Test Token: %s\n", tokenString)
}
