# EduPro Backend Setup Instructions

## 1. Database Setup

### Step 1: Get your Database URL
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `dixceqaeloiywxihgfem`
3. Go to Settings → Database
4. Copy the connection string under "Connection string" → "URI"
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Update Environment Variables
Update your `.env` file with the correct database URL:
```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.dixceqaeloiywxihgfem.supabase.co:5432/postgres
```

### Step 3: Run Database Schema
1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the contents of `setup_database.sql`
3. Run the SQL script

OR use the command line:
```bash
# Install PostgreSQL client if you don't have it
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql-client

# Run the schema (replace with your actual database URL)
psql "postgresql://postgres:YOUR_PASSWORD@db.dixceqaeloiywxihgfem.supabase.co:5432/postgres" -f setup_database.sql
```

## 2. Start the Backend

```bash
# Install dependencies (if not done)
go mod tidy

# Run the backend
go run cmd/api/main.go
```

You should see:
```
INFO    Starting EDUPRO API    {"version": "1.0.0", "environment": "development", "port": "8080"}
INFO    Database connection established successfully
INFO    Server starting    {"address": ":8080"}
```

## 3. Test the Backend

Test the health endpoint:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

## 4. Start the Frontend

```bash
cd /Users/mac/Desktop/code/edupro-web-v0

# Install dependencies (if not done)
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

## 5. Test the Integration

1. **Backend Health Check**: Visit http://localhost:8080/health
2. **Frontend**: Visit http://localhost:5173 (or the port shown in terminal)
3. **Test Registration**:
   - Go to the signup page
   - Create a new account
   - Complete the onboarding process
   - Data should be saved to your Supabase database

## 6. API Endpoints Available

### Public Endpoints
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `GET /version` - Version info
- `POST /api/internal/users` - Create user (called by frontend)

### Protected Endpoints (require JWT)
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/user/onboarding` - Get onboarding status
- `PUT /api/user/onboarding` - Update onboarding data
- `PUT /api/user/profile` - Update user profile

## 7. Testing with Postman/cURL

### Get User Profile
```bash
# First, get JWT token from frontend (browser dev tools)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/auth/me
```

### Update Onboarding
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "role": "undergraduate",
       "academic_details": {
         "university": "University of Lagos",
         "course": "Computer Science"
       }
     }' \
     http://localhost:8080/api/user/onboarding
```

## 8. Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check if your Supabase project is active
- Ensure you have the correct password

### JWT Issues
- Check SUPABASE_JWT_SECRET matches your Supabase project
- Verify JWT tokens are being sent correctly from frontend
- Check browser dev tools for authentication errors

### CORS Issues
- Ensure ALLOWED_ORIGINS includes your frontend URL
- Check if frontend is running on expected port

### Frontend API Issues
- Verify VITE_APP_SERVER_URL points to correct backend
- Check browser dev tools for API call errors
- Test backend endpoints directly first

## 9. Next Steps

Once everything is working:
1. Test user registration and login flow
2. Test onboarding data persistence
3. Test profile updates
4. Verify data appears correctly in Supabase dashboard
5. Deploy to production when ready

## 10. Production Deployment Notes

For production:
1. Set environment variables correctly
2. Use production Supabase database
3. Configure CORS for production domain
4. Set proper JWT secrets
5. Enable HTTPS
6. Set up monitoring and logging