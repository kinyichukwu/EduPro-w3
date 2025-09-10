-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar TEXT,
    supabase_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('jamb', 'undergraduate', 'university', 'masters', 'lecturer', 'custom')),
    custom_learning_goal TEXT,
    academic_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_role ON onboarding(role);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed_at ON onboarding(completed_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_updated_at 
    BEFORE UPDATE ON onboarding 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO users (email, username, full_name, supabase_id) VALUES
-- ('test@example.com', 'testuser', 'Test User', 'test-supabase-id-123')
-- ON CONFLICT (email) DO NOTHING;