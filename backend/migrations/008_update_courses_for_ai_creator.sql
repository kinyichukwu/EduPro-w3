-- Update Courses Table for AI Creator Functionality
-- This migration adds the necessary columns to the existing courses table

-- Add missing columns to the courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_modules INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS collection_mint_address VARCHAR(44);

-- Update existing courses to have a user_id (set to instructor_id if it exists)
UPDATE courses SET user_id = instructor_id WHERE user_id IS NULL AND instructor_id IS NOT NULL;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- Update the course stats function to work with the new columns
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

-- Update the course student count function
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

-- Ensure the triggers exist (they may have been created by the previous migration)
DROP TRIGGER IF EXISTS update_course_stats_on_module_insert ON course_modules;
DROP TRIGGER IF EXISTS update_course_stats_on_module_update ON course_modules;
DROP TRIGGER IF EXISTS update_course_stats_on_module_delete ON course_modules;

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

-- Ensure the enrollment triggers exist
DROP TRIGGER IF EXISTS update_course_student_count_on_enrollment_insert ON course_enrollments;
DROP TRIGGER IF EXISTS update_course_student_count_on_enrollment_delete ON course_enrollments;

CREATE TRIGGER update_course_student_count_on_enrollment_insert
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_student_count();

CREATE TRIGGER update_course_student_count_on_enrollment_delete
    AFTER DELETE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_student_count();
