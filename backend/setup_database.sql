-- EduPro Database Setup Script
-- Run this in your Supabase SQL Editor

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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = supabase_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = supabase_id);

-- RLS Policies for onboarding table
CREATE POLICY "Users can view own onboarding" ON onboarding
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = onboarding.user_id 
            AND users.supabase_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own onboarding" ON onboarding
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = onboarding.user_id 
            AND users.supabase_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own onboarding" ON onboarding
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = onboarding.user_id 
            AND users.supabase_id = auth.uid()::text
        )
    );

-- Insert statement verification
SELECT 'Database setup completed successfully!' as status;