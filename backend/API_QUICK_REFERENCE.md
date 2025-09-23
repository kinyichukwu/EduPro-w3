# New API Endpoints - Quick Reference

## Authentication

All endpoints require: `Authorization: Bearer <jwt_token>`

## 1. Update Course Status

```http
PATCH /api/courses/:id/status
Content-Type: application/json

{
  "status": "published"  // draft | published | archived
}
```

**Response:**

```json
{
  "success": true,
  "message": "Course status updated successfully",
  "data": {
    /* updated course object */
  }
}
```

## 2. Update Chapter

```http
PUT /api/chapters/:id
Content-Type: application/json

{
  "title": "New Chapter Title",
  "description": "Updated description",
  "content": "# Chapter content in markdown",
  "order_index": 2,
  "status": "completed"  // draft | completed
}
```

## 3. Delete Chapter

```http
DELETE /api/chapters/:id
```

## 4. Get Course Learning Content

```http
GET /api/courses/:id/learn
```

**Response:**

```json
{
  "success": true,
  "data": {
    "course": {
      /* course details */
    },
    "modules": [
      /* array of modules */
    ],
    "progress": {
      /* user progress if enrolled */
    }
  }
}
```

## 5. Get User Progress

```http
GET /api/courses/:id/progress
```

**Response:**

```json
{
  "success": true,
  "data": {
    "course_id": "uuid",
    "user_id": "uuid",
    "progress": 66.67,
    "completed_modules": 2,
    "total_modules": 3,
    "enrolled_at": "2025-09-23T11:00:00Z",
    "completed_at": null
  }
}
```

## 6. Update Progress

```http
PATCH /api/courses/:id/progress
Content-Type: application/json

{
  "module_id": "uuid",
  "completed": true,
  "progress": 100.0  // 0.0 to 100.0
}
```

## Error Responses

- **400**: Validation failed
- **401**: Unauthorized (missing/invalid token)
- **404**: Course/chapter not found
- **500**: Internal server error

All responses follow this format:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | null,
  "error": "string" // only on errors
}
```

## Notes

- Progress tracking auto-enrolls users
- Course completion detected automatically
- Only course owners can modify their courses
- `/learn` endpoint only works for published courses
