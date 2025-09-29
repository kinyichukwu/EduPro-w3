-- Migration: Add creator_wallet column to courses table
-- This stores the Solana wallet address of the course creator for payment routing

-- Add creator_wallet column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS creator_wallet TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_creator_wallet ON courses(creator_wallet);

-- Add comment
COMMENT ON COLUMN courses.creator_wallet IS 'Solana wallet address of the course creator for payment routing';


