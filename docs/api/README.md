# Note Weaver API Documentation

This documentation provides details about the Note Weaver API, including endpoints, data models, authentication, and usage examples.

## Table of Contents

1. [Authentication](#authentication)
2. [Data Models](#data-models)
3. [Endpoints](#endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

## Authentication

Note Weaver uses Supabase for authentication. All API requests must include a valid JWT token in the Authorization header.

```
Authorization: Bearer <jwt_token>
```

To obtain a JWT token, use the Supabase authentication endpoints:

- `POST /auth/v1/token`: Get a new JWT token
- `POST /auth/v1/logout`: Invalidate the current JWT token

## Data Models

Note Weaver uses the following data models:

### User

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the user |
| email | string | User's email address |
| created_at | timestamp | When the user was created |

### Profile

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the profile |
| user_id | string | Reference to the user |
| subscription_tier | string | 'free' or 'pro' |
| created_at | timestamp | When the profile was created |

### Note

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the note |
| user_id | string | Reference to the user |
| title | string | Note title |
| content | string | Note content (HTML) |
| tags | string[] | Array of tags |
| created_at | timestamp | When the note was created |
| updated_at | timestamp | When the note was last updated |

### Meeting

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the meeting |
| user_id | string | Reference to the user |
| title | string | Meeting title |
| transcript | string | Meeting transcript |
| summary | string | AI-generated summary |
| meeting_date | timestamp | Date of the meeting |
| created_at | timestamp | When the meeting was created |

### Action Item

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the action item |
| meeting_id | string | Reference to the meeting |
| description | string | Description of the action item |
| owner | string | Person responsible for the action item |
| due_date | timestamp | When the action item is due |
| status | string | 'pending', 'in_progress', or 'completed' |

## Endpoints

### Notes

- `GET /rest/v1/notes`: Get all notes for the authenticated user
- `GET /rest/v1/notes/:id`: Get a specific note
- `POST /rest/v1/notes`: Create a new note
- `PATCH /rest/v1/notes/:id`: Update a note
- `DELETE /rest/v1/notes/:id`: Delete a note

### Meetings

- `GET /rest/v1/meetings`: Get all meetings for the authenticated user
- `GET /rest/v1/meetings/:id`: Get a specific meeting
- `POST /rest/v1/meetings`: Create a new meeting
- `PATCH /rest/v1/meetings/:id`: Update a meeting
- `DELETE /rest/v1/meetings/:id`: Delete a meeting

### Action Items

- `GET /rest/v1/action_items`: Get all action items
- `GET /rest/v1/action_items/:id`: Get a specific action item
- `POST /rest/v1/action_items`: Create a new action item
- `PATCH /rest/v1/action_items/:id`: Update an action item
- `DELETE /rest/v1/action_items/:id`: Delete an action item

### Profiles

- `GET /rest/v1/profiles/:user_id`: Get a user's profile
- `PATCH /rest/v1/profiles/:user_id`: Update a user's profile

### AI Services

- `POST /api/v1/summarize`: Generate a summary from a meeting transcript
- `POST /api/v1/enhance`: Enhance a note with AI suggestions

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: The resource was created successfully
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: The user does not have permission to access the resource
- `404 Not Found`: The resource was not found
- `429 Too Many Requests`: The user has sent too many requests
- `500 Internal Server Error`: An error occurred on the server

Error responses include a JSON object with an `error` field:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. The limits are:

- Free tier: 100 requests per hour
- Pro tier: 1000 requests per hour

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1619712000
```

## Examples

### Create a Note

```javascript
const createNote = async (title, content, tags) => {
  const response = await fetch('https://api.noteweaver.com/rest/v1/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      content,
      tags
    })
  });
  
  return response.json();
};
```

### Get All Notes

```javascript
const getNotes = async () => {
  const response = await fetch('https://api.noteweaver.com/rest/v1/notes', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Process a Meeting Transcript

```javascript
const processMeeting = async (title, transcript) => {
  const response = await fetch('https://api.noteweaver.com/api/v1/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      transcript
    })
  });
  
  return response.json();
};
```

