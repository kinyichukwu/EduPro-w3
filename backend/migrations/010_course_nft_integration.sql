-- Migration: 010_course_nft_integration.sql
-- Add NFT and pricing fields to existing courses table

-- Add NFT and pricing columns to courses table
ALTER TABLE courses 
  ADD COLUMN IF NOT EXISTS price_edu_tokens BIGINT NOT NULL DEFAULT 0, -- price in smallest unit of EDU (1 EDU = 1,000,000,000 units)
  ADD COLUMN IF NOT EXISTS price_token_mint VARCHAR(44) DEFAULT '8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV', -- EDU token mint
  ADD COLUMN IF NOT EXISTS nft_mint_address VARCHAR(44) NULL, -- minted NFT mint for course (creator's NFT)
  ADD COLUMN IF NOT EXISTS platform_fee_bps INTEGER DEFAULT 250, -- platform cut in basis points (250 = 2.5%)
  ADD COLUMN IF NOT EXISTS nft_metadata_uri TEXT NULL, -- IPFS/Arweave URI for NFT metadata
  ADD COLUMN IF NOT EXISTS creation_tx_signature VARCHAR(88) NULL; -- transaction signature for course creation payment

-- Create purchases table for tracking course purchases
CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_wallet_address VARCHAR(44) NOT NULL,
  purchase_tx_signature VARCHAR(88) NOT NULL UNIQUE,
  nft_mint_address VARCHAR(44) NOT NULL,
  total_amount_paid BIGINT NOT NULL, -- total amount in EDU token units
  platform_amount BIGINT NOT NULL, -- platform cut in EDU token units
  seller_amount BIGINT NOT NULL, -- seller amount in EDU token units
  platform_fee_bps INTEGER NOT NULL,
  purchase_status VARCHAR(20) DEFAULT 'pending' CHECK (purchase_status IN ('pending', 'confirmed', 'failed')),
  nft_mint_tx_signature VARCHAR(88) NULL, -- NFT minting transaction signature
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(course_id, buyer_user_id) -- one purchase per user per course
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_nft_mint ON courses(nft_mint_address) WHERE nft_mint_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_price_tokens ON courses(price_edu_tokens) WHERE price_edu_tokens > 0;
CREATE INDEX IF NOT EXISTS idx_course_purchases_buyer ON course_purchases(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_tx ON course_purchases(purchase_tx_signature);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(purchase_status);

-- Update course_enrollments to link with purchases
ALTER TABLE course_enrollments 
  ADD COLUMN IF NOT EXISTS purchase_id UUID NULL REFERENCES course_purchases(id),
  ADD COLUMN IF NOT EXISTS enrollment_type VARCHAR(20) DEFAULT 'free' CHECK (enrollment_type IN ('free', 'purchased', 'gifted'));

-- Trigger to automatically create enrollment when purchase is confirmed
CREATE OR REPLACE FUNCTION create_enrollment_from_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create enrollment when purchase status changes to 'confirmed'
    IF NEW.purchase_status = 'confirmed' AND (OLD.purchase_status IS NULL OR OLD.purchase_status != 'confirmed') THEN
        INSERT INTO course_enrollments (course_id, user_id, purchase_id, enrollment_type, enrolled_at)
        VALUES (NEW.course_id, NEW.buyer_user_id, NEW.id, 'purchased', NEW.confirmed_at)
        ON CONFLICT (course_id, user_id) DO UPDATE SET
            purchase_id = NEW.id,
            enrollment_type = 'purchased',
            enrolled_at = NEW.confirmed_at;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_enrollment_on_purchase_confirmation
    AFTER UPDATE ON course_purchases
    FOR EACH ROW
    EXECUTE FUNCTION create_enrollment_from_purchase();
