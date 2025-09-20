-- Migration: 006_add_membership_nft_to_users.sql
-- Description: Add membership NFT address column to users table

-- Add membership_nft_address column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS membership_nft_address VARCHAR(44);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_membership_nft_address ON users(membership_nft_address);

-- Add comment for documentation
COMMENT ON COLUMN users.membership_nft_address IS 'The mint address of the user''s membership NFT';
