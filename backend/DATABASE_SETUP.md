# Database Setup Guide

This guide will help you set up the database for the EduPro Backend application.

## Prerequisites

- PostgreSQL database (can be provided by Supabase)
- Access to your database with CREATE TABLE privileges

## Database Setup

### 1. Run the Schema

Execute the SQL commands from `internal/services/database/schema.sql` in your PostgreSQL database:

```sql
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
```

### 2. Environment Variables

Make sure your `.env` file includes:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
```

### 3. Supabase Integration

If using Supabase:

1. Create a new Supabase project
2. Copy the database URL from your project settings
3. Copy the API URL and anon key from your project settings
4. Copy the JWT secret from your project settings
5. Run the schema in your Supabase SQL editor

### 4. Database Connection Test

The application will test the database connection on startup. Check the logs for:

```
Database connection established successfully
```

## API Endpoints

Once the database is set up, the following endpoints will be available:

### Authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/user/onboarding` - Get user onboarding status
- `PUT /api/user/onboarding` - Update user onboarding data
- `PUT /api/user/profile` - Update user profile

### Internal (for frontend integration)
- `POST /api/internal/users` - Create new user (called by frontend after Supabase auth)

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "avatar": "https://...",
  "supabase_id": "supabase-user-id",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Onboarding Data
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "jamb|undergraduate|university|masters|lecturer|custom",
  "custom_learning_goal": "Custom learning goal text",
  "academic_details": {
    "university": "University name",
    "course": "Course name",
    "jamb_details": {
      "preferred_university": "Preferred university",
      "preferred_course": "Preferred course",
      "target_score": "Target score",
      "jamb_year": "Year",
      "jamb_subjects": ["Subject 1", "Subject 2"]
    }
  },
  "created_at": "2023-01-01T00:00:00Z",
  "completed_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL is correct
- Check if PostgreSQL is running
- Ensure the database exists and user has proper permissions

### Schema Issues
- Make sure the uuid-ossp extension is installed
- Check for any syntax errors in the schema
- Verify all tables are created successfully

### JWT Issues
- Ensure SUPABASE_JWT_SECRET matches your Supabase project
- Check that JWT tokens are being sent in the Authorization header
- Verify token format: `Bearer <token>`