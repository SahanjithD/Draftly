# Draftly Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123",
  "email": "john@example.com",      // optional
  "fullName": "John Doe"             // optional
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe"
  }
}
```

---

### Login
**POST** `/auth/login`

Login with username/email and password.

**Request Body:**
```json
{
  "username": "johndoe",  // can also use email
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "profilePicture": "url"
  }
}
```

---

## Post Endpoints

### Get All Posts
**GET** `/posts`

Get all posts with pagination and search.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Posts per page
- `search` - Search in title and content

**Example:** `/posts?page=1&limit=10&search=docker`

**Response:**
```json
{
  "posts": [
    {
      "_id": "post_id",
      "title": "Post Title",
      "content": "Post content...",
      "author": {
        "_id": "author_id",
        "username": "johndoe",
        "profilePicture": "url"
      },
      "published": true,
      "createdAt": "2025-11-10T...",
      "updatedAt": "2025-11-10T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### Get Single Post
**GET** `/posts/:id`

Get a single post by ID.

**Response:**
```json
{
  "post": {
    "_id": "post_id",
    "title": "Post Title",
    "content": "Post content...",
    "author": {
      "_id": "author_id",
      "username": "johndoe",
      "profilePicture": "url",
      "bio": "Author bio"
    },
    "published": true,
    "createdAt": "2025-11-10T...",
    "updatedAt": "2025-11-10T..."
  }
}
```

---

### Create Post
**POST** `/posts` 🔒

Create a new post. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Post",
  "content": "This is the content of my post..."
}
```

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "post_id",
    "title": "My New Post",
    "content": "This is the content...",
    "author": {
      "_id": "author_id",
      "username": "johndoe"
    },
    "published": true,
    "createdAt": "2025-11-10T...",
    "updatedAt": "2025-11-10T..."
  }
}
```

---

### Update Post
**PUT** `/posts/:id` 🔒

Update a post. Only the author can update. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response:**
```json
{
  "message": "Post updated successfully",
  "post": { /* updated post object */ }
}
```

---

### Delete Post
**DELETE** `/posts/:id` 🔒

Delete a post. Only the author can delete. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

---

### Get My Posts
**GET** `/posts/user/my-posts` 🔒

Get all posts by the authenticated user. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "posts": [ /* array of posts */ ],
  "count": 5
}
```

---

## User Endpoints

### Get Current User Profile
**GET** `/users/profile` 🔒

Get the authenticated user's profile. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "My bio",
    "profilePicture": "url",
    "postCount": 10,
    "createdAt": "2025-11-10T...",
    "updatedAt": "2025-11-10T..."
  }
}
```

---

### Get User by Username
**GET** `/users/:username`

Get a user's public profile by username.

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "My bio",
    "profilePicture": "url",
    "postCount": 10,
    "createdAt": "2025-11-10T...",
    "updatedAt": "2025-11-10T..."
  }
}
```

---

### Update Profile
**PUT** `/users/profile` 🔒

Update the authenticated user's profile. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "newusername",       // optional
  "email": "newemail@example.com", // optional
  "fullName": "New Name",          // optional
  "bio": "My new bio",             // optional
  "profilePicture": "new_url"      // optional
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

### Change Password
**PUT** `/users/password` 🔒

Change the authenticated user's password. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

### Get User's Posts
**GET** `/users/:username/posts`

Get all posts by a specific user.

**Response:**
```json
{
  "posts": [ /* array of posts by this user */ ]
}
```

---

## Statistics Endpoints

### Get Platform Stats
**GET** `/stats`

Get platform-wide statistics.

**Response:**
```json
{
  "stats": {
    "totalPosts": 150,
    "totalUsers": 50,
    "recentPosts": 12,
    "topAuthors": [
      {
        "_id": "author_id",
        "username": "johndoe",
        "postCount": 15
      }
    ]
  }
}
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request**
```json
{
  "message": "Error message describing what went wrong"
}
```

**401 Unauthorized**
```json
{
  "message": "No token provided, authorization denied"
}
```

**403 Forbidden**
```json
{
  "message": "Not authorized to perform this action"
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "message": "Server error while processing request"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@example.com"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### Create Post (with token)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My Post","content":"Post content here"}'
```

### Get All Posts
```bash
curl http://localhost:5000/api/posts
```

---

## PowerShell Examples

### Register
```powershell
$body = @{
    username = "testuser"
    password = "test123"
    email = "test@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Create Post
```powershell
$token = "YOUR_TOKEN_HERE"
$body = @{
    title = "My Post"
    content = "Post content here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/posts" -Method POST -Headers @{Authorization="Bearer $token"} -Body $body -ContentType "application/json"
```

---

## Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire after 7 days
- Passwords must be at least 6 characters
- Usernames must be 3-30 characters
- Profile pictures should be URLs (file upload not yet implemented)
- CORS is enabled for all origins (configure for production)
