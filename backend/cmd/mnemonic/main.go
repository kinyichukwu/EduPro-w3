package main

import (
	"crypto/ed25519"
	"crypto/sha512"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/gagliardetto/solana-go"
	"golang.org/x/crypto/pbkdf2"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run cmd/mnemonic/main.go \"mnemonic phrase here\"")
		fmt.Println("Example: go run cmd/mnemonic/main.go \"word1 word2 word3 ... word12\"")
		os.Exit(1)
	}

	mnemonic := strings.Join(os.Args[1:], " ")

	// Convert mnemonic to private key
	privateKey, err := mnemonicToPrivateKey(mnemonic)
	if err != nil {
		log.Fatal("Failed to convert mnemonic to private key:", err)
	}

	publicKey := privateKey.PublicKey()

	fmt.Println("🔑 Mnemonic to Private Key Conversion")
	fmt.Println("====================================")
	fmt.Printf("📝 Mnemonic: %s\n", mnemonic)
	fmt.Printf("🔐 Private Key (Base58): %s\n", privateKey.String())
	fmt.Printf("📍 Public Key: %s\n", publicKey.String())
	fmt.Println()
	fmt.Println("⚠️  SECURITY WARNING:")
	fmt.Println("• Keep your private key secure and never share it!")
	fmt.Println("• This private key gives full access to your wallet!")
	fmt.Println()
	fmt.Println("🔧 To set as environment variable:")
	fmt.Printf("export SOLANA_PRIVATE_KEY=\"%s\"\n", privateKey.String())
	fmt.Println()
	fmt.Println("📋 Or add to your .env file:")
	fmt.Printf("SOLANA_PRIVATE_KEY=%s\n", privateKey.String())
}

// mnemonicToPrivateKey converts a BIP39 mnemonic to a Solana private key
func mnemonicToPrivateKey(mnemonic string) (solana.PrivateKey, error) {
	// Normalize the mnemonic
	words := strings.Fields(strings.TrimSpace(mnemonic))
	normalizedMnemonic := strings.Join(words, " ")

	// Convert mnemonic to seed using PBKDF2 (BIP39 standard)
	seed := pbkdf2.Key([]byte(normalizedMnemonic), []byte("mnemonic"), 2048, 64, sha512.New)

	// Use the first 32 bytes as the private key seed
	privateKeySeed := seed[:32]

	// Create ed25519 private key from seed
	privateKey := ed25519.NewKeyFromSeed(privateKeySeed)

	// Convert to Solana private key format
	solanaPrivateKey := solana.PrivateKey(privateKey)

	return solanaPrivateKey, nil
}
