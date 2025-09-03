# Note Weaver API Endpoints

This document provides detailed information about the Note Weaver API endpoints, including request and response formats, authentication requirements, and examples.

## Authentication Endpoints

### Sign Up

Creates a new user account.

- **URL**: `/auth/v1/signup`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "created_at": "2023-01-01T00:00:00Z"
      },
      "session": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expires_at": 1672531200
      }
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "error": {
        "message": "Email already registered",
        "code": "EMAIL_TAKEN"
      }
    }
    ```

### Sign In

Authenticates a user and returns a session.

- **URL**: `/auth/v1/token`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "created_at": "2023-01-01T00:00:00Z"
      },
      "session": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expires_at": 1672531200
      }
    }
    ```
- **Error Response**:
  - **Code**: 401
  - **Content**:
    ```json
    {
      "error": {
        "message": "Invalid login credentials",
        "code": "INVALID_CREDENTIALS"
      }
    }
    ```

### Sign Out

Invalidates the current session.

- **URL**: `/auth/v1/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
- **Error Response**:
  - **Code**: 401
  - **Content**:
    ```json
    {
      "error": {
        "message": "Invalid or expired token",
        "code": "INVALID_TOKEN"
      }
    }
    ```

## Notes Endpoints

### Get All Notes

Retrieves all notes for the authenticated user.

- **URL**: `/rest/v1/notes`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  ```
- **Query Parameters**:
  - `order`: Field to order by (e.g., `created_at.desc`)
  - `limit`: Maximum number of notes to return
  - `offset`: Number of notes to skip
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Meeting Notes",
        "content": "<p>Important points from the meeting...</p>",
        "tags": ["meeting", "project"],
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      },
      {
        "id": "223e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Project Ideas",
        "content": "<p>Ideas for the new project...</p>",
        "tags": ["ideas", "project"],
        "created_at": "2023-01-02T00:00:00Z",
        "updated_at": "2023-01-02T00:00:00Z"
      }
    ]
    ```
- **Error Response**:
  - **Code**: 401
  - **Content**:
    ```json
    {
      "error": {
        "message": "Invalid or expired token",
        "code": "INVALID_TOKEN"
      }
    }
    ```

### Get a Note

Retrieves a specific note.

- **URL**: `/rest/v1/notes/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  ```
- **URL Parameters**:
  - `id`: ID of the note to retrieve
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Meeting Notes",
      "content": "<p>Important points from the meeting...</p>",
      "tags": ["meeting", "project"],
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
    ```
- **Error Response**:
  - **Code**: 404
  - **Content**:
    ```json
    {
      "error": {
        "message": "Note not found",
        "code": "NOT_FOUND"
      }
    }
    ```

### Create a Note

Creates a new note.

- **URL**: `/rest/v1/notes`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "title": "Meeting Notes",
    "content": "<p>Important points from the meeting...</p>",
    "tags": ["meeting", "project"]
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**:
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Meeting Notes",
      "content": "<p>Important points from the meeting...</p>",
      "tags": ["meeting", "project"],
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "error": {
        "message": "Title is required",
        "code": "VALIDATION_ERROR"
      }
    }
    ```

### Update a Note

Updates an existing note.

- **URL**: `/rest/v1/notes/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **URL Parameters**:
  - `id`: ID of the note to update
- **Request Body**:
  ```json
  {
    "title": "Updated Meeting Notes",
    "content": "<p>Updated points from the meeting...</p>",
    "tags": ["meeting", "project", "updated"]
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Updated Meeting Notes",
      "content": "<p>Updated points from the meeting...</p>",
      "tags": ["meeting", "project", "updated"],
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T01:00:00Z"
    }
    ```
- **Error Response**:
  - **Code**: 404
  - **Content**:
    ```json
    {
      "error": {
        "message": "Note not found",
        "code": "NOT_FOUND"
      }
    }
    ```

### Delete a Note

Deletes a note.

- **URL**: `/rest/v1/notes/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  ```
- **URL Parameters**:
  - `id`: ID of the note to delete
- **Success Response**:
  - **Code**: 204
  - **Content**: None
- **Error Response**:
  - **Code**: 404
  - **Content**:
    ```json
    {
      "error": {
        "message": "Note not found",
        "code": "NOT_FOUND"
      }
    }
    ```

## Meetings Endpoints

### Get All Meetings

Retrieves all meetings for the authenticated user.

- **URL**: `/rest/v1/meetings`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  ```
- **Query Parameters**:
  - `order`: Field to order by (e.g., `meeting_date.desc`)
  - `limit`: Maximum number of meetings to return
  - `offset`: Number of meetings to skip
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Team Meeting",
        "transcript": "John: Let's discuss the project timeline...",
        "summary": "The team discussed the project timeline and assigned tasks.",
        "meeting_date": "2023-01-01T00:00:00Z",
        "created_at": "2023-01-01T00:00:00Z",
        "action_items": [
          {
            "id": "123e4567-e89b-12d3-a456-426614174001",
            "meeting_id": "123e4567-e89b-12d3-a456-426614174000",
            "description": "Create project timeline",
            "owner": "John Doe",
            "due_date": "2023-01-15T00:00:00Z",
            "status": "pending"
          }
        ]
      }
    ]
    ```
- **Error Response**:
  - **Code**: 401
  - **Content**:
    ```json
    {
      "error": {
        "message": "Invalid or expired token",
        "code": "INVALID_TOKEN"
      }
    }
    ```

### Get a Meeting

Retrieves a specific meeting.

- **URL**: `/rest/v1/meetings/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  ```
- **URL Parameters**:
  - `id`: ID of the meeting to retrieve
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Team Meeting",
      "transcript": "John: Let's discuss the project timeline...",
      "summary": "The team discussed the project timeline and assigned tasks.",
      "meeting_date": "2023-01-01T00:00:00Z",
      "created_at": "2023-01-01T00:00:00Z",
      "action_items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174001",
          "meeting_id": "123e4567-e89b-12d3-a456-426614174000",
          "description": "Create project timeline",
          "owner": "John Doe",
          "due_date": "2023-01-15T00:00:00Z",
          "status": "pending"
        }
      ]
    }
    ```
- **Error Response**:
  - **Code**: 404
  - **Content**:
    ```json
    {
      "error": {
        "message": "Meeting not found",
        "code": "NOT_FOUND"
      }
    }
    ```

### Create a Meeting

Creates a new meeting.

- **URL**: `/rest/v1/meetings`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "title": "Team Meeting",
    "transcript": "John: Let's discuss the project timeline...",
    "summary": "The team discussed the project timeline and assigned tasks.",
    "meeting_date": "2023-01-01T00:00:00Z",
    "action_items": [
      {
        "description": "Create project timeline",
        "owner": "John Doe",
        "due_date": "2023-01-15T00:00:00Z",
        "status": "pending"
      }
    ]
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**:
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Team Meeting",
      "transcript": "John: Let's discuss the project timeline...",
      "summary": "The team discussed the project timeline and assigned tasks.",
      "meeting_date": "2023-01-01T00:00:00Z",
      "created_at": "2023-01-01T00:00:00Z",
      "action_items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174001",
          "meeting_id": "123e4567-e89b-12d3-a456-426614174000",
          "description": "Create project timeline",
          "owner": "John Doe",
          "due_date": "2023-01-15T00:00:00Z",
          "status": "pending"
        }
      ]
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "error": {
        "message": "Title is required",
        "code": "VALIDATION_ERROR"
      }
    }
    ```

## Action Items Endpoints

### Get All Action Items

Retrieves all action items.

- **URL**: `/rest/v1/action_items`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  ```
- **Query Parameters**:
  - `order`: Field to order by (e.g., `due_date.asc`)
  - `limit`: Maximum number of action items to return
  - `offset`: Number of action items to skip
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "meeting_id": "123e4567-e89b-12d3-a456-426614174000",
        "description": "Create project timeline",
        "owner": "John Doe",
        "due_date": "2023-01-15T00:00:00Z",
        "status": "pending",
        "meeting": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "title": "Team Meeting",
          "meeting_date": "2023-01-01T00:00:00Z"
        }
      }
    ]
    ```
- **Error Response**:
  - **Code**: 401
  - **Content**:
    ```json
    {
      "error": {
        "message": "Invalid or expired token",
        "code": "INVALID_TOKEN"
      }
    }
    ```

### Update an Action Item

Updates an action item.

- **URL**: `/rest/v1/action_items/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **URL Parameters**:
  - `id`: ID of the action item to update
- **Request Body**:
  ```json
  {
    "description": "Updated project timeline",
    "owner": "Jane Doe",
    "due_date": "2023-01-20T00:00:00Z",
    "status": "completed"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "meeting_id": "123e4567-e89b-12d3-a456-426614174000",
      "description": "Updated project timeline",
      "owner": "Jane Doe",
      "due_date": "2023-01-20T00:00:00Z",
      "status": "completed"
    }
    ```
- **Error Response**:
  - **Code**: 404
  - **Content**:
    ```json
    {
      "error": {
        "message": "Action item not found",
        "code": "NOT_FOUND"
      }
    }
    ```

## AI Services Endpoints

### Generate Meeting Summary

Generates a summary from a meeting transcript.

- **URL**: `/api/v1/summarize`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "transcript": "John: Let's discuss the project timeline...\nJane: I think we should start with the design phase...\nJohn: Agreed. Let's set a deadline for next Friday..."
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "summary": "The team discussed the project timeline and agreed to start with the design phase.",
      "keyPoints": [
        "Start with design phase",
        "Design phase deadline set for next Friday"
      ],
      "decisions": [
        "Start with design phase",
        "Set deadline for next Friday"
      ],
      "actionItems": [
        {
          "description": "Complete design phase",
          "owner": "Team",
          "dueDate": "Next Friday",
          "status": "pending"
        }
      ]
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "error": {
        "message": "Transcript is required",
        "code": "VALIDATION_ERROR"
      }
    }
    ```

### Enhance Note

Enhances a note with AI suggestions.

- **URL**: `/api/v1/enhance`
- **Method**: `POST`
- **Auth Required**: Yes
- **Headers**:
  ```
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "content": "<p>Project ideas for the new website...</p>"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "suggestions": "Consider adding sections for user research, design principles, and technical requirements.",
      "tags": ["project", "website", "ideas"],
      "actionItems": [
        {
          "description": "Conduct user research",
          "owner": null,
          "dueDate": null
        },
        {
          "description": "Define design principles",
          "owner": null,
          "dueDate": null
        }
      ]
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "error": {
        "message": "Content is required",
        "code": "VALIDATION_ERROR"
      }
    }
    ```

