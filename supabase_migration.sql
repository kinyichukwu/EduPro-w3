-- =====================================================
-- EduPro Solana Integration Database Migration
-- =====================================================

-- 1. Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT wallets_address_check CHECK (length(address) BETWEEN 32 AND 44)
);

-- 2. Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    token_symbol TEXT NOT NULL CHECK (token_symbol IN ('SOL', 'USDC', 'PYUSD')),
    transaction_id TEXT UNIQUE, -- Solana signature
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    block_height BIGINT,
    price_id TEXT, -- Reference to course/subscription
    metadata JSONB, -- Additional payment data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_verified ON wallets(is_verified);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_wallet_address ON payment_transactions(wallet_address);

-- 4. Add RLS (Row Level Security) policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Wallets policies
CREATE POLICY "Users can view their own wallets" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets" ON wallets
    FOR DELETE USING (auth.uid() = user_id);

-- Payment transactions policies
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can view all (optional - adjust based on your needs)
-- CREATE POLICY "Admins can view all wallets" ON wallets
--     FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admins can view all payment transactions" ON payment_transactions
--     FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Create updated_at trigger for wallets
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at 
    BEFORE UPDATE ON wallets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Create useful views
CREATE OR REPLACE VIEW user_wallet_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(w.id) as total_wallets,
    COUNT(CASE WHEN w.is_verified THEN 1 END) as verified_wallets,
    MAX(w.created_at) as last_wallet_connected
FROM auth.users u
LEFT JOIN wallets w ON u.id = w.user_id
GROUP BY u.id, u.email;

CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    user_id,
    COUNT(*) as total_payments,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_payments,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
    SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) as total_confirmed_amount,
    MAX(created_at) as last_payment_at
FROM payment_transactions
GROUP BY user_id;

-- 7. Insert sample data (optional - for testing)
-- Uncomment if you want test data
/*
INSERT INTO wallets (user_id, address, is_verified) VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'DemoWallet1234567890123456789012345', true);

INSERT INTO payment_transactions (user_id, wallet_address, amount, token_symbol, status, price_id) VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'DemoWallet1234567890123456789012345', 0.1, 'SOL', 'confirmed', 'course_demo');
*/

-- 8. Grant necessary permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON wallets TO authenticated;
-- GRANT SELECT, INSERT ON payment_transactions TO authenticated;

-- =====================================================
-- Migration Complete!
-- =====================================================

-- Verify the migration
SELECT 'Wallets table created' as status, COUNT(*) as count FROM wallets;
SELECT 'Payment transactions table created' as status, COUNT(*) as count FROM payment_transactions;
