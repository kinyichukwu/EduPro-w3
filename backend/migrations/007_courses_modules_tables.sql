-- Course and Module Tables Migration
-- This migration creates tables for AI Creator course functionality

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    total_modules INTEGER DEFAULT 0,
    completed_modules INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    earnings DECIMAL(10,2) DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT 10.00, -- Course creation fee
    thumbnail_url TEXT,
    collection_mint_address VARCHAR(44),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course modules table
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    order_index INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- Module links/resources table
CREATE TABLE IF NOT EXISTS module_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments table (for tracking students)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress DECIMAL(5,2) DEFAULT 0.00, -- Percentage completion
    UNIQUE(course_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_modules_status ON course_modules(status);

CREATE INDEX IF NOT EXISTS idx_module_links_module_id ON module_links(module_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_enrolled_at ON course_enrollments(enrolled_at DESC);

-- Triggers to automatically update updated_at
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at 
    BEFORE UPDATE ON course_modules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update course stats when modules are modified
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_modules and completed_modules count for the course
    UPDATE courses 
    SET 
        total_modules = (
            SELECT COUNT(*) 
            FROM course_modules 
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        ),
        completed_modules = (
            SELECT COUNT(*) 
            FROM course_modules 
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id) 
            AND status = 'completed'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Function to update course student count when enrollments change
CREATE OR REPLACE FUNCTION update_course_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update students_count for the course
    UPDATE courses 
    SET 
        students_count = (
            SELECT COUNT(*) 
            FROM course_enrollments 
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update course stats when modules are added, updated, or deleted
CREATE TRIGGER update_course_stats_on_module_insert
    AFTER INSERT ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_course_stats();

CREATE TRIGGER update_course_stats_on_module_update
    AFTER UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_course_stats();

CREATE TRIGGER update_course_stats_on_module_delete
    AFTER DELETE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_course_stats();

-- Triggers to update course student count when enrollments change
CREATE TRIGGER update_course_student_count_on_enrollment_insert
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_student_count();

CREATE TRIGGER update_course_student_count_on_enrollment_delete
    AFTER DELETE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_student_count();
