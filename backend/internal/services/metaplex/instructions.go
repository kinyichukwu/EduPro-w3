package metaplex

import (
	"encoding/binary"
	"fmt"

	"github.com/gagliardetto/solana-go"
)

// Metaplex instruction discriminators
const (
	CreateMetadataAccountV3Discriminator                 = 33
	CreateMasterEditionV3Discriminator                   = 17
	MintNewEditionFromMasterEditionViaTokenDiscriminator = 14
)

// CreateMetadataAccountV3 creates a metadata account instruction
func (s *Service) CreateMetadataAccountV3(
	metadataAccount, mint, mintAuthority, payer, updateAuthority solana.PublicKey,
	data MetadataData,
	isMutable bool,
) solana.Instruction {
	// Instruction data layout:
	// - 8 bytes: discriminator
	// - 4 bytes: data length
	// - data: metadata data
	// - 1 byte: is_mutable

	dataBytes := s.serializeMetadataData(data)

	instructionData := make([]byte, 8+4+len(dataBytes)+1)

	// Discriminator
	binary.LittleEndian.PutUint64(instructionData[0:8], CreateMetadataAccountV3Discriminator)

	// Data length
	binary.LittleEndian.PutUint32(instructionData[8:12], uint32(len(dataBytes)))

	// Data
	copy(instructionData[12:12+len(dataBytes)], dataBytes)

	// Is mutable
	if isMutable {
		instructionData[12+len(dataBytes)] = 1
	} else {
		instructionData[12+len(dataBytes)] = 0
	}

	accounts := []*solana.AccountMeta{
		{PublicKey: metadataAccount, IsSigner: false, IsWritable: true},
		{PublicKey: mint, IsSigner: false, IsWritable: false},
		{PublicKey: mintAuthority, IsSigner: true, IsWritable: false},
		{PublicKey: payer, IsSigner: true, IsWritable: true},
		{PublicKey: updateAuthority, IsSigner: false, IsWritable: false},
		{PublicKey: solana.SystemProgramID, IsSigner: false, IsWritable: false},
		{PublicKey: solana.SysVarRentPubkey, IsSigner: false, IsWritable: false},
	}

	return solana.NewInstruction(
		s.tokenMetadataProgram,
		accounts,
		instructionData,
	)
}

// CreateMasterEditionV3 creates a master edition instruction
func (s *Service) CreateMasterEditionV3(
	edition, mint, updateAuthority, mintAuthority, payer solana.PublicKey,
	maxSupply *uint64,
) solana.Instruction {
	// Instruction data layout:
	// - 8 bytes: discriminator
	// - 8 bytes: max_supply (optional)

	instructionData := make([]byte, 8+8)

	// Discriminator
	binary.LittleEndian.PutUint64(instructionData[0:8], CreateMasterEditionV3Discriminator)

	// Max supply
	if maxSupply != nil {
		binary.LittleEndian.PutUint64(instructionData[8:16], *maxSupply)
	} else {
		// 0 means unlimited supply
		binary.LittleEndian.PutUint64(instructionData[8:16], 0)
	}

	accounts := []*solana.AccountMeta{
		{PublicKey: edition, IsSigner: false, IsWritable: true},
		{PublicKey: mint, IsSigner: false, IsWritable: true},
		{PublicKey: updateAuthority, IsSigner: true, IsWritable: false},
		{PublicKey: mintAuthority, IsSigner: true, IsWritable: false},
		{PublicKey: payer, IsSigner: true, IsWritable: true},
		{PublicKey: solana.SystemProgramID, IsSigner: false, IsWritable: false},
		{PublicKey: solana.SysVarRentPubkey, IsSigner: false, IsWritable: false},
	}

	return solana.NewInstruction(
		s.tokenMetadataProgram,
		accounts,
		instructionData,
	)
}

// MetadataData represents the metadata data structure
type MetadataData struct {
	Name                 string
	Symbol               string
	URI                  string
	SellerFeeBasisPoints uint16
	Creators             *[]Creator
	Collection           *Collection
	Uses                 *Uses
}

// Creator represents a creator of the NFT
type Creator struct {
	Address  solana.PublicKey
	Verified bool
	Share    uint8
}

// Collection represents the collection information
type Collection struct {
	Verified bool
	Key      solana.PublicKey
}

// Uses represents the uses information
type Uses struct {
	UseMethod UseMethod
	Remaining uint64
	Total     uint64
}

// UseMethod represents how the NFT can be used
type UseMethod uint8

const (
	UseMethodBurn UseMethod = iota
	UseMethodMultiple
	UseMethodSingle
)

// serializeMetadataData serializes the metadata data
func (s *Service) serializeMetadataData(data MetadataData) []byte {
	// This is a simplified serialization
	// In production, you'd use the exact Metaplex serialization format

	// For now, return a placeholder
	return []byte(fmt.Sprintf("metadata:%s:%s:%s", data.Name, data.Symbol, data.URI))
}

// getMetadataAccountAddress calculates the metadata account address
func (s *Service) getMetadataAccountAddress(mint solana.PublicKey) (solana.PublicKey, error) {
	seeds := [][]byte{
		[]byte("metadata"),
		s.tokenMetadataProgram.Bytes(),
		mint.Bytes(),
	}

	metadataAccount, _, err := solana.FindProgramAddress(seeds, s.tokenMetadataProgram)
	if err != nil {
		return solana.PublicKey{}, fmt.Errorf("failed to find metadata program address: %w", err)
	}

	return metadataAccount, nil
}

// getMasterEditionAccountAddress calculates the master edition account address
func (s *Service) getMasterEditionAccountAddress(mint solana.PublicKey) (solana.PublicKey, error) {
	seeds := [][]byte{
		[]byte("metadata"),
		s.tokenMetadataProgram.Bytes(),
		mint.Bytes(),
		[]byte("edition"),
	}

	masterEditionAccount, _, err := solana.FindProgramAddress(seeds, s.tokenMetadataProgram)
	if err != nil {
		return solana.PublicKey{}, fmt.Errorf("failed to find master edition program address: %w", err)
	}

	return masterEditionAccount, nil
}

// getEditionAccountAddress calculates the edition account address
func (s *Service) getEditionAccountAddress(mint solana.PublicKey) (solana.PublicKey, error) {
	seeds := [][]byte{
		[]byte("metadata"),
		s.tokenMetadataProgram.Bytes(),
		mint.Bytes(),
		[]byte("edition"),
	}

	editionAccount, _, err := solana.FindProgramAddress(seeds, s.tokenMetadataProgram)
	if err != nil {
		return solana.PublicKey{}, fmt.Errorf("failed to find edition program address: %w", err)
	}

	return editionAccount, nil
}

// getAssociatedTokenAccountAddress calculates the associated token account address
func (s *Service) getAssociatedTokenAccountAddress(owner, mint solana.PublicKey) (solana.PublicKey, error) {
	associatedTokenAccount, _, err := solana.FindAssociatedTokenAddress(owner, mint)
	if err != nil {
		return solana.PublicKey{}, fmt.Errorf("failed to find associated token address: %w", err)
	}

	return associatedTokenAccount, nil
}
