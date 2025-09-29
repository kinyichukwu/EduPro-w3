-- Fix course_purchases table schema to match expected structure
-- This script will rename/add columns to match the NFT purchase implementation

-- First, rename existing columns to match expected names
ALTER TABLE course_purchases RENAME COLUMN user_id TO buyer_user_id;
ALTER TABLE course_purchases RENAME COLUMN transaction_signature TO purchase_tx_signature;

-- Add missing columns
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS buyer_wallet_address VARCHAR(44);
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS nft_mint_address VARCHAR(44);
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS total_amount_paid BIGINT;
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS platform_amount BIGINT;
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS seller_amount BIGINT;
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS platform_fee_bps INTEGER;
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS purchase_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS nft_mint_tx_signature VARCHAR(88);
ALTER TABLE course_purchases ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update purchase_status column to have proper constraints
ALTER TABLE course_purchases DROP CONSTRAINT IF EXISTS course_purchases_purchase_status_check;
ALTER TABLE course_purchases ADD CONSTRAINT course_purchases_purchase_status_check 
    CHECK (purchase_status IN ('pending', 'confirmed', 'failed'));

-- Set default values for existing rows if any exist
UPDATE course_purchases SET 
    purchase_status = 'confirmed' WHERE purchase_status IS NULL,
    created_at = purchased_at WHERE created_at IS NULL,
    total_amount_paid = COALESCE(amount_paid_lamports, 0) WHERE total_amount_paid IS NULL,
    platform_amount = 0 WHERE platform_amount IS NULL,
    seller_amount = COALESCE(amount_paid_lamports, 0) WHERE seller_amount IS NULL,
    platform_fee_bps = 250 WHERE platform_fee_bps IS NULL;

-- Make required columns NOT NULL (after setting defaults)
ALTER TABLE course_purchases ALTER COLUMN buyer_user_id SET NOT NULL;
ALTER TABLE course_purchases ALTER COLUMN buyer_wallet_address SET NOT NULL;
ALTER TABLE course_purchases ALTER COLUMN purchase_tx_signature SET NOT NULL;
ALTER TABLE course_purchases ALTER COLUMN nft_mint_address SET NOT NULL;
ALTER TABLE course_purchases ALTER COLUMN total_amount_paid SET NOT NULL;
ALTER TABLE course_purchases ALTER COLUMN platform_amount SET NOT NULL;
ALTER TABLE course_purchases ALTER COLUMN seller_amount SET NOT NULL;
ALTER TABLE course_purchases ALTER COLUMN platform_fee_bps SET NOT NULL;

-- Add unique constraint on purchase_tx_signature
ALTER TABLE course_purchases ADD CONSTRAINT course_purchases_purchase_tx_signature_key 
    UNIQUE (purchase_tx_signature);

-- Add unique constraint on course_id, buyer_user_id
ALTER TABLE course_purchases ADD CONSTRAINT course_purchases_course_buyer_key 
    UNIQUE (course_id, buyer_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_purchases_buyer ON course_purchases(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_tx ON course_purchases(purchase_tx_signature);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(purchase_status);

-- Add creator_wallet column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS creator_wallet VARCHAR(44);
CREATE INDEX IF NOT EXISTS idx_courses_creator_wallet ON courses(creator_wallet);

-- Add NFT and pricing columns to courses table if they don't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_edu_tokens BIGINT NOT NULL DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_token_mint VARCHAR(44) DEFAULT '8kNjLpVVoMK6QY5zQgjavDYmLzULnboxrPcry6Cf4urV';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS nft_mint_address VARCHAR(44) NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS platform_fee_bps INTEGER DEFAULT 250;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS nft_metadata_uri TEXT NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS creation_tx_signature VARCHAR(88) NULL;

-- Create indexes for courses NFT fields
CREATE INDEX IF NOT EXISTS idx_courses_nft_mint ON courses(nft_mint_address) WHERE nft_mint_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_price_tokens ON courses(price_edu_tokens) WHERE price_edu_tokens > 0;

-- Update course_enrollments to link with purchases
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS purchase_id UUID NULL;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS enrollment_type VARCHAR(20) DEFAULT 'free';

-- Add constraint for enrollment_type
ALTER TABLE course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_enrollment_type_check;
ALTER TABLE course_enrollments ADD CONSTRAINT course_enrollments_enrollment_type_check 
    CHECK (enrollment_type IN ('free', 'purchased', 'gifted'));

-- Add foreign key constraint for purchase_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_enrollments_purchase_id_fkey'
  ) THEN
    ALTER TABLE course_enrollments 
      ADD CONSTRAINT course_enrollments_purchase_id_fkey 
      FOREIGN KEY (purchase_id) REFERENCES course_purchases(id);
  END IF;
END $$;

-- Create trigger function for automatic enrollment
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

-- Create trigger
DROP TRIGGER IF EXISTS create_enrollment_on_purchase_confirmation ON course_purchases;
CREATE TRIGGER create_enrollment_on_purchase_confirmation
    AFTER UPDATE ON course_purchases
    FOR EACH ROW
    EXECUTE FUNCTION create_enrollment_from_purchase();

-- Display final schema
SELECT 'course_purchases columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'course_purchases' 
ORDER BY ordinal_position;

SELECT 'courses NFT columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name IN ('price_edu_tokens', 'creator_wallet', 'nft_mint_address', 'platform_fee_bps', 'nft_metadata_uri', 'creation_tx_signature')
ORDER BY ordinal_position;


