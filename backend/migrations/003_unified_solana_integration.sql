-- Migration: 003_unified_solana_integration.sql
-- Description: Unified Solana integration consolidating both payment and staking/rewards systems
-- Created: 2025-09-15
-- Replaces: 002_solana_tables.sql and supabase_migration.sql wallet tables

-- =====================================================
-- UNIFIED WALLET TABLE
-- =====================================================
-- This replaces both 'wallets' and 'user_wallets' tables
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL, -- Solana addresses are base58 encoded, max 44 chars
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, wallet_address),
    -- Constraints
    CONSTRAINT wallet_address_check CHECK (length(wallet_address) BETWEEN 32 AND 44)
);

-- =====================================================
-- UNIFIED PAYMENT TRANSACTIONS TABLE
-- =====================================================
-- This consolidates payment_transactions and course_purchases
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL,
    transaction_signature VARCHAR(88) NOT NULL UNIQUE, -- Solana transaction signature
    
    -- Payment details
    amount_lamports BIGINT, -- Amount in lamports (for SOL payments)
    amount_tokens BIGINT, -- Amount in tokens (for token payments)
    token_symbol VARCHAR(20) NOT NULL CHECK (token_symbol IN ('SOL', 'USDC', 'PYUSD', 'EDUTOKEN')),
    token_mint VARCHAR(44), -- Token mint address (null for SOL)
    
    -- Transaction metadata
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('SOL', 'USDC', 'PYUSD', 'EDUTOKEN', 'MIXED')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
    block_height BIGINT,
    
    -- Reference data
    price_id TEXT, -- Reference to course/subscription/item being purchased
    course_id UUID, -- Direct reference to course if applicable
    metadata JSONB, -- Additional payment/purchase metadata
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraint for course_id (optional)
    CONSTRAINT fk_payment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- =====================================================
-- COURSES TABLE
-- =====================================================
-- Purchasable courses with multi-token pricing
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_lamports BIGINT NOT NULL DEFAULT 0, -- Price in lamports (1 SOL = 1,000,000,000 lamports)
    price_edutoken BIGINT DEFAULT 0, -- Price in EduToken (if applicable)
    price_usd_cents INTEGER DEFAULT 0, -- Price in USD cents for reference
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB, -- Additional course metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REWARDS SYSTEM
-- =====================================================
-- User rewards for various activities
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL, -- 'course_completion', 'quiz_score', 'daily_login', 'referral', 'staking'
    reward_amount_edutoken BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    transaction_signature VARCHAR(88), -- If reward was distributed on-chain
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'failed')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distributed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB -- Additional reward metadata (quiz scores, course info, etc.)
);

-- =====================================================
-- STAKING SYSTEM
-- =====================================================
-- Staking positions for EduToken
CREATE TABLE IF NOT EXISTS staking_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL,
    staked_amount_edutoken BIGINT NOT NULL,
    stake_account_address VARCHAR(44), -- On-chain stake account address
    staking_program_id VARCHAR(44) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unstaking', 'withdrawn')),
    staked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unstaked_at TIMESTAMP WITH TIME ZONE,
    rewards_earned BIGINT DEFAULT 0,
    last_reward_calculation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SWAP TRANSACTIONS
-- =====================================================
-- Jupiter swap transactions for token exchanges
CREATE TABLE IF NOT EXISTS swap_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_signature VARCHAR(88) NOT NULL,
    input_mint VARCHAR(44) NOT NULL, -- Token mint address being swapped from
    output_mint VARCHAR(44) NOT NULL, -- Token mint address being swapped to
    input_amount BIGINT NOT NULL,
    output_amount BIGINT NOT NULL,
    slippage_bps INTEGER NOT NULL, -- Slippage in basis points
    platform_fee_bps INTEGER NOT NULL, -- Platform fee in basis points
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    swapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User wallets indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_primary ON user_wallets(user_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_wallets_verified ON user_wallets(is_verified);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_wallet_address ON payment_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_signature ON payment_transactions(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_course_id ON payment_transactions(course_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_price_id ON payment_transactions(price_id);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_price_lamports ON courses(price_lamports);

-- User rewards indexes
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_type ON user_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);
CREATE INDEX IF NOT EXISTS idx_user_rewards_earned_at ON user_rewards(earned_at DESC);

-- Staking positions indexes
CREATE INDEX IF NOT EXISTS idx_staking_positions_user_id ON staking_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_positions_wallet ON staking_positions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_staking_positions_status ON staking_positions(status);

-- Swap transactions indexes
CREATE INDEX IF NOT EXISTS idx_swap_transactions_user_id ON swap_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_signature ON swap_transactions(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_status ON swap_transactions(status);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

CREATE TRIGGER update_user_wallets_updated_at 
    BEFORE UPDATE ON user_wallets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- This migration consolidates:
-- 1. 'wallets' table (from Solana Pay integration) -> 'user_wallets'
-- 2. 'payment_transactions' (simple) + 'course_purchases' -> unified 'payment_transactions'
-- 3. All reward, staking, and swap functionality in one place
-- 
-- The unified structure supports:
-- - Solana Pay integration (SOL, USDC, PYUSD payments)
-- - Course purchases with multiple payment methods
-- - EduToken rewards and distribution
-- - Staking functionality
-- - Token swaps via Jupiter
-- 
-- Data migration from old tables should be handled separately if needed.
