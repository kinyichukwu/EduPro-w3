-- Migration: 002_solana_tables.sql
-- Description: Add Solana-related tables for wallets, rewards, courses, purchases, and staking
-- Created: 2025-09-14

-- User wallets table for Solana wallet addresses
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(44) NOT NULL, -- Solana addresses are base58 encoded, max 44 chars
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, wallet_address)
);

-- Courses table for purchasable content
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_lamports BIGINT NOT NULL DEFAULT 0, -- Price in lamports (1 SOL = 1,000,000,000 lamports)
    price_edutoken BIGINT DEFAULT 0, -- Price in EduToken (if applicable)
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB, -- Additional course metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course purchases table
CREATE TABLE IF NOT EXISTS course_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    transaction_signature VARCHAR(88) NOT NULL, -- Solana transaction signature
    amount_paid_lamports BIGINT NOT NULL,
    amount_paid_edutoken BIGINT DEFAULT 0,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('SOL', 'EDUTOKEN', 'MIXED')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded')),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id, transaction_signature)
);

-- Rewards table for tracking user rewards
CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL, -- 'course_completion', 'quiz_score', 'daily_login', etc.
    reward_amount_edutoken BIGINT NOT NULL DEFAULT 0,
    description TEXT,
    transaction_signature VARCHAR(88), -- If reward was distributed on-chain
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'failed')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distributed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB -- Additional reward metadata
);

-- Staking positions table (if implementing off-chain staking tracking)
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

-- Jupiter swap transactions table (for tracking token swaps)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_primary ON user_wallets(user_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_price_lamports ON courses(price_lamports);

CREATE INDEX IF NOT EXISTS idx_course_purchases_user_id ON course_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course_id ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(status);
CREATE INDEX IF NOT EXISTS idx_course_purchases_signature ON course_purchases(transaction_signature);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_type ON user_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);

CREATE INDEX IF NOT EXISTS idx_staking_positions_user_id ON staking_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_positions_wallet ON staking_positions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_staking_positions_status ON staking_positions(status);

CREATE INDEX IF NOT EXISTS idx_swap_transactions_user_id ON swap_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_signature ON swap_transactions(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_swap_transactions_status ON swap_transactions(status);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_user_wallets_updated_at 
    BEFORE UPDATE ON user_wallets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

