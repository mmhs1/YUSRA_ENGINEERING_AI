# Backend API Specification

## Base URL
`/api/v1`

## Error Model
```json
{
  "error": {
    "code": 401,
    "message": "Unauthorized"
  }
}
```

## Authentication

### `POST /auth/register`
Creates a new user.
- **Request Body**:
  - `email`: string
  - `password`: string
  - `name`: string
- **Response**: `200 OK`
  - `token`: string (JWT)
  - `user`: object

### `POST /auth/login`
Authenticates a user.
- **Request Body**:
  - `email`: string
  - `password`: string
- **Response**: `200 OK`
  - `token`: string (JWT)
  - `user`: object

## Users

### `GET /users/me`
Fetches logged-in user details.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  - `user`: object

## Conversations

### `POST /conversations`
Creates a new conversation thread.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  - `conversation`: object

### `GET /conversations`
Lists user's conversations.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  - `conversations`: array of objects

### `GET /conversations/:id/messages`
Lists messages in a conversation.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  - `messages`: array of objects

### `POST /conversations/:id/messages`
Appends a message.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  - `content`: string
- **Response**: `200 OK`
  - `message`: object

## Media

### `POST /media/request-upload`
Request signed URL for upload.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  - `filename`: string
  - `contentType`: string
- **Response**: `200 OK`
  - `uploadUrl`: string
  - `uploadId`: string

### `POST /media/complete-upload`
Record completed upload.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  - `url`: string
  - `type`: string
  - `messageId`: string
- **Response**: `200 OK`
  - `media`: object
