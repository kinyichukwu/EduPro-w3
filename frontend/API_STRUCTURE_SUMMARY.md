# EduPro Web v0 - Onboarding API Structure & Enhancement Summary

## Overview

This document outlines the essential API structure needed for the Go backend to handle user onboarding and the custom learning preference enhancement implemented in the frontend.

## 🚀 **Enhancement Implemented**

### Custom Learning Preference Feature

- **Added "Other/Custom" option** to the role selection in onboarding
- **Conditional input field** appears when "Custom" is selected
- **Validation** ensures custom learning goal is provided before proceeding
- **Integrated** into the complete onboarding flow and data collection

### UI/UX Improvements

- Orange/red gradient theme for custom option
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Clear validation feedback

---

## 📊 **Complete Data Collection Flow**

### Step 1: Role Selection

```typescript
{
  selectedRole: "jamb" | "undergraduate" | "university" | "masters" | "lecturer" | "custom"
  customLearningGoal?: string // Only for custom role
}
```

### Step 2: Academic Details (Role-Specific)

#### JAMB Students

```typescript
{
  preferredUniversity: string
  preferredCourse: string
  targetScore?: string
  jambYear?: string
  jambSubjects: string[] // max 4 subjects
}
```

#### University Students (undergraduate/university/masters)

```typescript
{
  university: string
  course: string
  level?: string
  matricNumber?: string
}
```

#### Lecturers

```typescript
{
  university: string // labeled as "Institution"
  course: string // labeled as "Department/Subject"
  experience?: string
  title?: string // academic title
}
```

#### Custom Learners (NEW)

```typescript
{
  customLearningGoal: string
  educationLevel?: string
  experienceLevel?: string
  additionalDetails?: string
}
```

### Step 3: Confirmation

- Display summary and complete onboarding

---

## 🔧 **Go Backend API Structures**

### Core Data Types

```go
// Main Onboarding Data Structure
type OnboardingData struct {
    Role               string          `json:"role" validate:"required,oneof=jamb undergraduate university masters lecturer custom"`
    CustomLearningGoal *string         `json:"custom_learning_goal,omitempty"`
    AcademicDetails    AcademicDetails `json:"academic_details"`
    CreatedAt          time.Time       `json:"created_at"`
    CompletedAt        *time.Time      `json:"completed_at,omitempty"`
}

// Academic Details (Role-Specific)
type AcademicDetails struct {
    // Common fields
    University *string `json:"university,omitempty"`
    Course     *string `json:"course,omitempty"`

    // Role-specific details
    JAMBDetails       *JAMBDetails       `json:"jamb_details,omitempty"`
    UniversityDetails *UniversityDetails `json:"university_details,omitempty"`
    LecturerDetails   *LecturerDetails   `json:"lecturer_details,omitempty"`
    CustomDetails     *CustomDetails     `json:"custom_details,omitempty"`
}

// JAMB-Specific Details
type JAMBDetails struct {
    PreferredUniversity string   `json:"preferred_university"`
    PreferredCourse     string   `json:"preferred_course"`
    TargetScore         *string  `json:"target_score,omitempty"`
    JAMBYear           *string  `json:"jamb_year,omitempty"`
    JAMBSubjects       []string `json:"jamb_subjects" validate:"max=4"`
}

// University Student Details
type UniversityDetails struct {
    CurrentUniversity string  `json:"current_university"`
    CurrentCourse     string  `json:"current_course"`
    CurrentLevel      *string `json:"current_level,omitempty"`
    MatricNumber      *string `json:"matric_number,omitempty"`
}

// Lecturer Details
type LecturerDetails struct {
    Institution   string  `json:"institution"`
    Department    string  `json:"department"`
    Experience    *string `json:"experience,omitempty"`
    AcademicTitle *string `json:"academic_title,omitempty"`
}

// Custom Learning Details (NEW)
type CustomDetails struct {
    LearningGoal      string  `json:"learning_goal"`
    EducationLevel    *string `json:"education_level,omitempty"`
    ExperienceLevel   *string `json:"experience_level,omitempty"`
    AdditionalDetails *string `json:"additional_details,omitempty"`
}

// User Profile Response (for /me endpoint)
type UserProfile struct {
    ID             uint           `json:"id"`
    Email          string         `json:"email"`
    Username       string         `json:"username"`
    FullName       *string        `json:"full_name,omitempty"`
    Avatar         *string        `json:"avatar,omitempty"`
    OnboardingData *OnboardingData `json:"onboarding_data,omitempty"`
    CreatedAt      time.Time      `json:"created_at"`
    UpdatedAt      time.Time      `json:"updated_at"`
}

// Onboarding Update Request
type OnboardingUpdateRequest struct {
    OnboardingData OnboardingData `json:"onboarding_data" validate:"required"`
}

// Onboarding Response
type OnboardingResponse struct {
    OnboardingData *OnboardingData `json:"onboarding_data,omitempty"`
    IsCompleted    bool           `json:"is_completed"`
    Message        string         `json:"message"`
}
```

---

## 🌐 **Required API Endpoints**

### Essential Endpoints (Current Implementation)

```go
// Authentication
GET  /api/auth/me           // Get current user profile with onboarding status
POST /api/auth/refresh      // Refresh JWT token

// Onboarding Management
PUT  /api/user/onboarding   // Update/complete onboarding data
GET  /api/user/onboarding   // Get current onboarding status
```

### Endpoint Details

#### `GET /api/auth/me`

**Purpose**: Get current authenticated user's profile and onboarding status  
**Auth**: JWT Required  
**Response**: `UserProfile`

#### `POST /api/auth/refresh`

**Purpose**: Refresh JWT token  
**Auth**: Valid refresh token  
**Response**: New JWT token

#### `PUT /api/user/onboarding`

**Purpose**: Update or complete user onboarding data  
**Auth**: JWT Required  
**Request Body**: `OnboardingUpdateRequest`  
**Response**: `OnboardingResponse`

#### `GET /api/user/onboarding`

**Purpose**: Get current onboarding status and data  
**Auth**: JWT Required  
**Response**: `OnboardingResponse`

---

## 📱 **Frontend Integration**

### Authentication Flow

1. **Login/Register**: Handled by frontend with Supabase
2. **JWT Management**: Frontend manages JWT tokens
3. **Protected Requests**: All API calls include JWT header
4. **Onboarding**: Uses backend APIs for data persistence

### Authentication Store Integration

```typescript
// Current implementation in useAuthStore.ts
interface OnboardingData {
  role: string;
  customLearningGoal?: string;
  academicDetails?: {
    // All form fields from onboarding steps
  };
  completedAt?: Date;
}

// Method to update onboarding
updateOnboarding: async (data: OnboardingData) => Promise<void>;
```

---

## 🔄 **Data Flow**

1. **User Authentication**: Frontend handles login/register with Supabase
2. **JWT Token**: Frontend receives and manages JWT for API calls
3. **Onboarding Check**: Call `GET /api/auth/me` to check onboarding status
4. **Onboarding Process**: User completes 3-step onboarding flow
5. **Data Submission**: Call `PUT /api/user/onboarding` with collected data
6. **Completion**: User redirected to dashboard

---

## 🎯 **Custom Learning Goal Examples**

The custom input field accepts various learning goals:

- "Professional certification preparation"
- "Language learning (Spanish)"
- "Data science bootcamp"
- "Medical entrance exam preparation"
- "Skill development in web development"
- "Personal hobby learning"

---

## ✅ **Implementation Status**

### ✅ Completed (Frontend)

- [x] Custom role option in Step 1
- [x] Conditional input field for custom learning goals
- [x] Form validation and state management
- [x] UI/UX design with proper theming
- [x] TypeScript interfaces and type safety
- [x] Integration with authentication store
- [x] Responsive design implementation

### 🔄 Next Steps (Backend Implementation)

- [ ] Implement the 4 essential API endpoints
- [ ] Database schema for onboarding data
- [ ] JWT authentication middleware
- [ ] Data validation and sanitization
- [ ] API testing and documentation

---

## 🚀 **Future API Additions**

The following endpoints will be added in future iterations:

### Profile Management (Future)

```go
PUT  /api/user/profile          // Update profile information
PUT  /api/user/profile/avatar   // Update profile avatar
PUT  /api/user/profile/password // Change password
```

### Usage & Subscription (Future)

```go
GET  /api/user/usage            // Get current usage statistics
GET  /api/user/subscription     // Get subscription details
PUT  /api/user/subscription     // Update subscription
```

### Referrals (Future)

```go
GET  /api/user/referrals        // Get referral information
POST /api/user/referrals/generate-code // Generate new referral code
```

### Additional User Management (Future)

```go
POST /api/auth/register         // Backend user registration
POST /api/auth/login            // Backend user login
POST /api/auth/logout           // Backend logout
DELETE /api/user/account        // Delete user account
GET  /api/user/activity         // User activity logs
```

---

## 🛠 **Development Notes**

### Current Focus

- **Minimal API Surface**: Only 4 endpoints needed for MVP
- **Frontend-First Auth**: Supabase handles authentication
- **Onboarding-Centric**: Core focus on collecting and persisting onboarding data
- **JWT Integration**: Backend validates JWT for protected routes

### File Changes Made

1. `src/landing/onboarding/OnboardingStep1.tsx` - Added custom option and input
2. `src/landing/onboarding/Onboarding.tsx` - State management and validation
3. `src/landing/onboarding/OnboardingStep2.tsx` - Custom form section
4. `src/landing/onboarding/OnboardingStep3.tsx` - Custom role display
5. `src/store/useAuthStore.ts` - Enhanced with onboarding data structures

### Key Technical Decisions

- **Simplified API**: Focus on essential onboarding functionality
- **JWT-Based Auth**: Leverage existing Supabase authentication
- **Flexible Data Structure**: Support for all role types including custom
- **Type Safety**: Full TypeScript support for frontend-backend integration

This streamlined implementation focuses on the core onboarding functionality while providing a clear path for future API expansion.
