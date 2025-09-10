# EduPro Backend API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The JWT token is obtained from Supabase authentication on the frontend.

---

## API Endpoints

### 🔓 Public Endpoints

#### Health Check
```http
GET /health
```

**Description:** Check if the backend server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

---

### 🔐 Authentication Endpoints

#### Get Current User Profile
```http
GET /api/auth/me
```

**Description:** Get the current authenticated user's profile including onboarding status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "onboarding_data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "undergraduate",
    "custom_learning_goal": null,
    "academic_details": {
      "university": "University of Lagos",
      "course": "Computer Science",
      "university_details": {
        "current_university": "University of Lagos",
        "current_course": "Computer Science",
        "current_level": "300",
        "matric_number": "CSC/2021/001"
      }
    },
    "created_at": "2025-01-01T12:00:00Z",
    "completed_at": "2025-01-01T12:30:00Z",
    "updated_at": "2025-01-01T12:30:00Z"
  },
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:30:00Z"
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "Authorization header is required"
}

// 404 Not Found
{
  "error": "User not found"
}
```

---

#### Refresh JWT Token
```http
POST /api/auth/refresh
```

**Description:** Refresh the JWT access token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

---

### 👤 User Management Endpoints

#### Get Onboarding Status
```http
GET /api/user/onboarding
```

**Description:** Get the current user's onboarding data and completion status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "onboarding_data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "jamb",
    "custom_learning_goal": null,
    "academic_details": {
      "jamb_details": {
        "preferred_university": "University of Lagos",
        "preferred_course": "Computer Science",
        "target_score": "300",
        "jamb_year": "2025",
        "jamb_subjects": ["Mathematics", "English", "Physics", "Chemistry"]
      }
    },
    "created_at": "2025-01-01T12:00:00Z",
    "completed_at": "2025-01-01T12:30:00Z",
    "updated_at": "2025-01-01T12:30:00Z"
  },
  "is_completed": true,
  "message": "Onboarding data retrieved successfully"
}
```

**Response (No Onboarding Data):**
```json
{
  "onboarding_data": null,
  "is_completed": false,
  "message": "No onboarding data found"
}
```

---

#### Update/Complete Onboarding
```http
PUT /api/user/onboarding
```

**Description:** Create or update user onboarding data. Auto-creates user if they don't exist in the backend database.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "undergraduate",
  "custom_learning_goal": null,
  "academic_details": {
    "university": "University of Lagos",
    "course": "Computer Science",
    "university_details": {
      "current_university": "University of Lagos",
      "current_course": "Computer Science",
      "current_level": "300",
      "matric_number": "CSC/2021/001"
    }
  }
}
```

**Response:**
```json
{
  "onboarding_data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "undergraduate",
    "custom_learning_goal": null,
    "academic_details": {
      "university": "University of Lagos",
      "course": "Computer Science",
      "university_details": {
        "current_university": "University of Lagos",
        "current_course": "Computer Science",
        "current_level": "300",
        "matric_number": "CSC/2021/001"
      }
    },
    "created_at": "2025-01-01T12:00:00Z",
    "completed_at": "2025-01-01T12:30:00Z",
    "updated_at": "2025-01-01T12:30:00Z"
  },
  "is_completed": true,
  "message": "Onboarding updated successfully"
}
```

---

#### Update User Profile
```http
PUT /api/user/profile
```

**Description:** Update user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johnsmith",
  "full_name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johnsmith",
  "full_name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg",
  "supabase_id": "84b59750-23e1-49be-9fd2-aac201de6947",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:35:00Z"
}
```

---

### 🔧 Internal Endpoints

#### Create User (Internal)
```http
POST /api/internal/users
```

**Description:** Create a new user in the backend database. This is typically called by the frontend after Supabase authentication.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "supabase_id": "84b59750-23e1-49be-9fd2-aac201de6947"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "avatar": null,
  "supabase_id": "84b59750-23e1-49be-9fd2-aac201de6947",
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

---

## Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;                    // Internal UUID
  email: string;
  username: string;
  full_name?: string;
  avatar?: string;
  onboarding_data?: OnboardingData;
  created_at: string;           // ISO 8601 timestamp
  updated_at: string;           // ISO 8601 timestamp
}
```

### Onboarding Data
```typescript
interface OnboardingData {
  id?: string;                  // Internal UUID
  user_id?: string;            // Internal user UUID
  role: 'jamb' | 'undergraduate' | 'university' | 'masters' | 'lecturer' | 'custom';
  custom_learning_goal?: string;
  academic_details?: AcademicDetails;
  created_at?: string;         // ISO 8601 timestamp
  completed_at?: string;       // ISO 8601 timestamp (null if not completed)
  updated_at?: string;         // ISO 8601 timestamp
}
```

### Academic Details
```typescript
interface AcademicDetails {
  university?: string;          // Common field
  course?: string;             // Common field
  
  // Role-specific details (only one will be populated based on role)
  jamb_details?: JAMBDetails;
  university_details?: UniversityDetails;
  lecturer_details?: LecturerDetails;
  custom_details?: CustomDetails;
}
```

### Role-Specific Details

#### JAMB Details
```typescript
interface JAMBDetails {
  preferred_university: string;
  preferred_course: string;
  target_score?: string;
  jamb_year?: string;
  jamb_subjects: string[];     // Maximum 4 subjects
}
```

#### University Details
```typescript
interface UniversityDetails {
  current_university: string;
  current_course: string;
  current_level?: string;      // e.g., "100", "200", "300"
  matric_number?: string;
}
```

#### Lecturer Details
```typescript
interface LecturerDetails {
  institution: string;         // University/Institution name
  department: string;          // Department/Subject area
  experience?: string;         // Years of experience
  academic_title?: string;     // e.g., "Professor", "Dr.", "Mr."
}
```

#### Custom Learning Details
```typescript
interface CustomDetails {
  learning_goal: string;       // Custom learning objective
  education_level?: string;    // Current education level
  experience_level?: string;   // Experience in the field
  additional_details?: string; // Any additional information
}
```

---

## Example Request Flows

### 1. User Registration & Onboarding
```javascript
// 1. User signs up with Supabase (frontend)
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// 2. Create user in backend (optional - auto-created during onboarding)
const response = await fetch('/api/internal/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'johndoe',
    supabase_id: data.user.id
  })
});

// 3. Complete onboarding
const onboardingResponse = await fetch('/api/user/onboarding', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'undergraduate',
    academic_details: {
      university: 'University of Lagos',
      course: 'Computer Science',
      university_details: {
        current_university: 'University of Lagos',
        current_course: 'Computer Science',
        current_level: '300'
      }
    }
  })
});
```

### 2. Getting User Data
```javascript
// Get complete user profile with onboarding
const userProfile = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});

// Get only onboarding status
const onboardingStatus = await fetch('/api/user/onboarding', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
});
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": "Field 'role' failed validation: required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Authorization header is required"
}
```

```json
{
  "error": "Invalid token"
}
```

#### 404 Not Found
```json
{
  "error": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to update onboarding"
}
```

---

## Environment Variables

Make sure these are set in your frontend environment:

```env
VITE_APP_SERVER_URL=http://localhost:8080
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Notes for Frontend Implementation

1. **JWT Token Management**: Always include the JWT token from Supabase in the Authorization header for protected endpoints.

2. **Auto-User Creation**: The backend automatically creates users if they don't exist when calling `/api/user/onboarding`. You don't need to explicitly call `/api/internal/users` unless you want to create the user immediately after registration.

3. **Onboarding Flow**: 
   - Check onboarding status with `GET /api/user/onboarding`
   - Update/complete onboarding with `PUT /api/user/onboarding`
   - The `completed_at` field indicates if onboarding is finished

4. **Error Handling**: All endpoints return consistent error formats. Check the `error` field in responses.

5. **Data Validation**: The backend validates all input data. Custom roles require a `custom_learning_goal` field.

6. **CORS**: The backend is configured to accept requests from `http://localhost:3000`, `http://localhost:5173`, and `http://localhost:5174`.

---

## Contact

For any questions about the API implementation, please reach out to the backend development team.