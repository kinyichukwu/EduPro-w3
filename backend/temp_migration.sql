-- Create course_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_wallet_address VARCHAR(44) NOT NULL,
  purchase_tx_signature VARCHAR(88) NOT NULL UNIQUE,
  nft_mint_address VARCHAR(44) NOT NULL,
  total_amount_paid BIGINT NOT NULL,
  platform_amount BIGINT NOT NULL,
  seller_amount BIGINT NOT NULL,
  platform_fee_bps INTEGER NOT NULL,
  purchase_status VARCHAR(20) DEFAULT 'pending' CHECK (purchase_status IN ('pending', 'confirmed', 'failed')),
  nft_mint_tx_signature VARCHAR(88) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(course_id, buyer_user_id)
);

-- Add creator_wallet column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS creator_wallet VARCHAR(44) NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_course_purchases_buyer ON course_purchases(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(purchase_status);
