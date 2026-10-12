# SnapGrid - RESTful API Documentation

This document specifies all backend REST API endpoints for **SnapGrid**, including authentication requirements, request parameters, response schemas, and sample `curl` invocations.

**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register New User
Creates a new user account and returns a JWT token.

- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "username": "coder_alex",
  "email": "alex@example.com",
  "password": "password123",
  "full_name": "Alex Rivera"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"coder_alex","email":"alex@example.com","password":"password123","full_name":"Alex Rivera"}'
```

#### Response Body (`201 Created`):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 3,
    "username": "coder_alex",
    "email": "alex@example.com",
    "full_name": "Alex Rivera",
    "profile_image_url": "https://placehold.co/150",
    "created_at": "2026-10-12T14:30:00.000Z"
  }
}
```

---

### 1.2 User Login
Authenticates an existing user and returns an access token.

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "bio": "Photographer & Tech enthusiast",
    "profile_image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
  }
}
```

---

### 1.3 Get Current Authenticated Profile
Validates JWT and returns current user details.

- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "user": {
    "user_id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "bio": "Photographer & Tech enthusiast",
    "profile_image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "created_at": "2026-10-10T10:00:00.000Z"
  }
}
```

---

## 2. User Profile Endpoints (`/api/users`)

### 2.1 Get User by ID
Fetches public profile data for a specific user.

- **Method**: `GET`
- **URL**: `/api/users/:id`
- **Auth Required**: No

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/users/2
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "user": {
    "user_id": 2,
    "username": "jane_smith",
    "full_name": "Jane Smith",
    "bio": "Designer & Traveler",
    "profile_image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    "created_at": "2026-10-10T10:05:00.000Z"
  }
}
```

---

### 2.2 Get User Statistics (View: `user_statistics`)
Retrieves aggregated counts of posts, followers, and following.

- **Method**: `GET`
- **URL**: `/api/users/:id/stats`
- **Auth Required**: No

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/users/2/stats
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "stats": {
    "user_id": 2,
    "username": "jane_smith",
    "post_count": 8,
    "followers_count": 45,
    "following_count": 32
  }
}
```

---

### 2.3 Get User Posts
Fetches all posts created by a specific user.

- **Method**: `GET`
- **URL**: `/api/users/:id/posts`
- **Auth Required**: No

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/users/2/posts
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "posts": [
    {
      "post_id": 14,
      "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "caption": "Sunset by the beach! 🌅",
      "created_at": "2026-10-12T11:00:00.000Z",
      "likes_count": 12,
      "comments_count": 4
    }
  ]
}
```

---

### 2.4 Update Profile
Updates biography, full name, or profile picture URL for the authenticated user.

- **Method**: `PUT`
- **URL**: `/api/users/profile`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:
```json
{
  "full_name": "Johnathan Doe",
  "bio": "Senior Software Architect & Landscape Photographer",
  "profile_image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
}
```

#### Example cURL:
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Johnathan Doe","bio":"Senior Software Architect"}'
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "user": {
    "user_id": 1,
    "full_name": "Johnathan Doe",
    "bio": "Senior Software Architect"
  }
}
```

---

## 3. Posts Endpoints (`/api/posts`)

### 3.1 Get Posts Feed
Returns a chronologically ordered feed of posts with author details, like counts, and comments.

- **Method**: `GET`
- **URL**: `/api/posts?limit=10&page=1`
- **Auth Required**: Optional (provides `has_liked` if authenticated)

#### Example cURL:
```bash
curl -X GET "http://localhost:5000/api/posts?limit=10&page=1" \
  -H "Authorization: Bearer <TOKEN>"
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "data": [
    {
      "post_id": 10,
      "caption": "Golden hour in the mountains 🏔️",
      "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      "created_at": "2026-10-12T09:15:00.000Z",
      "author": {
        "user_id": 1,
        "username": "john_doe",
        "profile_image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
      },
      "likes_count": 25,
      "comments_count": 6,
      "has_liked": true
    }
  ]
}
```

---

### 3.2 Create New Post
Creates a new photo post.

- **Method**: `POST`
- **URL**: `/api/posts`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:
```json
{
  "image_url": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  "caption": "Curious kitten exploring the yard 🐱"
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://images.unsplash.com/photo-1518791841217-8f162f1e1131","caption":"Curious kitten"}'
```

#### Response Body (`201 Created`):
```json
{
  "status": "success",
  "message": "Post created successfully",
  "post": {
    "post_id": 21,
    "user_id": 1,
    "image_url": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
    "caption": "Curious kitten",
    "created_at": "2026-10-12T14:40:00.000Z"
  }
}
```

---

### 3.3 Delete Post
Deletes a post owned by the authenticated user.

- **Method**: `DELETE`
- **URL**: `/api/posts/:id`
- **Auth Required**: Yes (`Bearer <token>`)

#### Example cURL:
```bash
curl -X DELETE http://localhost:5000/api/posts/21 \
  -H "Authorization: Bearer <TOKEN>"
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "message": "Post deleted successfully"
}
```

---

## 4. Likes Endpoints (`/api/posts/:id/like`)

### 4.1 Toggle Like / Unlike
Toggles like status for the authenticated user on a post.

- **Method**: `POST`
- **URL**: `/api/posts/:id/like`
- **Auth Required**: Yes (`Bearer <token>`)

#### Example cURL:
```bash
curl -X POST http://localhost:5000/api/posts/10/like \
  -H "Authorization: Bearer <TOKEN>"
```

#### Response Body (`200 OK` - Liked):
```json
{
  "status": "success",
  "action": "liked",
  "likes_count": 26
}
```

#### Response Body (`200 OK` - Unliked):
```json
{
  "status": "success",
  "action": "unliked",
  "likes_count": 25
}
```

---

### 4.2 Get Users Who Liked Post
Returns list of users who have liked a specific post.

- **Method**: `GET`
- **URL**: `/api/posts/:id/likes`
- **Auth Required**: No

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/posts/10/likes
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "likes": [
    {
      "user_id": 2,
      "username": "jane_smith",
      "full_name": "Jane Smith",
      "profile_image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      "liked_at": "2026-10-12T10:00:00.000Z"
    }
  ]
}
```

---

## 5. Comments Endpoints (`/api/posts/:id/comments`)

### 5.1 Get Comments on Post
Lists all comments for a post ordered chronologically.

- **Method**: `GET`
- **URL**: `/api/posts/:id/comments`
- **Auth Required**: No

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/posts/10/comments
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "comments": [
    {
      "comment_id": 105,
      "comment_text": "Incredible lighting on this!",
      "created_at": "2026-10-12T10:15:00.000Z",
      "user": {
        "user_id": 2,
        "username": "jane_smith",
        "profile_image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
      }
    }
  ]
}
```

---

### 5.2 Add Comment to Post
Appends a new comment to a post.

- **Method**: `POST`
- **URL**: `/api/posts/:id/comments`
- **Auth Required**: Yes (`Bearer <token>`)

#### Request Body:
```json
{
  "comment_text": "This landscape is unreal! Great capture."
}
```

#### Example cURL:
```bash
curl -X POST http://localhost:5000/api/posts/10/comments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"comment_text":"This landscape is unreal! Great capture."}'
```

#### Response Body (`201 Created`):
```json
{
  "status": "success",
  "message": "Comment posted successfully",
  "comment": {
    "comment_id": 106,
    "post_id": 10,
    "user_id": 1,
    "comment_text": "This landscape is unreal! Great capture.",
    "created_at": "2026-10-12T14:45:00.000Z"
  }
}
```

---

### 5.3 Delete Comment
Deletes a comment if authored by the authenticated user or owner of the post.

- **Method**: `DELETE`
- **URL**: `/api/comments/:id`
- **Auth Required**: Yes (`Bearer <token>`)

#### Example cURL:
```bash
curl -X DELETE http://localhost:5000/api/comments/106 \
  -H "Authorization: Bearer <TOKEN>"
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

---

## 6. Follows Endpoints (`/api/users/:id/follow`)

### 6.1 Toggle Follow / Unfollow
Follows or unfollows another user.

- **Method**: `POST`
- **URL**: `/api/users/:id/follow`
- **Auth Required**: Yes (`Bearer <token>`)

#### Example cURL:
```bash
curl -X POST http://localhost:5000/api/users/2/follow \
  -H "Authorization: Bearer <TOKEN>"
```

#### Response Body (`200 OK` - Followed):
```json
{
  "status": "success",
  "action": "followed",
  "message": "You are now following jane_smith"
}
```

#### Response Body (`200 OK` - Unfollowed):
```json
{
  "status": "success",
  "action": "unfollowed",
  "message": "You have unfollowed jane_smith"
}
```

---

### 6.2 Get User Followers
Retrieves all users following the specified user ID.

- **Method**: `GET`
- **URL**: `/api/users/:id/followers`
- **Auth Required**: No

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/users/2/followers
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "followers": [
    {
      "user_id": 1,
      "username": "john_doe",
      "full_name": "John Doe",
      "profile_image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  ]
}
```

---

### 6.3 Get User Following
Retrieves all users that the specified user ID is following.

- **Method**: `GET`
- **URL**: `/api/users/:id/following`
- **Auth Required**: No

#### Example cURL:
```bash
curl -X GET http://localhost:5000/api/users/2/following
```

#### Response Body (`200 OK`):
```json
{
  "status": "success",
  "following": [
    {
      "user_id": 3,
      "username": "coder_alex",
      "full_name": "Alex Rivera",
      "profile_image_url": "https://placehold.co/150"
    }
  ]
}
```
