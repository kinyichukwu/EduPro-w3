-- Module Progress Table Migration
-- This migration creates table for tracking user progress in individual modules

-- Module progress table
CREATE TABLE IF NOT EXISTS module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    progress DECIMAL(5,2) DEFAULT 0.00, -- Percentage completion (0-100)
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_completed ON module_progress(completed);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_module ON module_progress(user_id, module_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_module_progress_updated_at 
    BEFORE UPDATE ON module_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
