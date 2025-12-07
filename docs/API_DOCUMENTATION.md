# 📚 TravelShip API Documentation

Base URL: `http://localhost:5000/api/v1`

## 🔐 Authentication

All authenticated requests must include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Refresh tokens are stored in httpOnly cookies.

---

## Auth Endpoints

### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "both" // Optional: "sender" | "shipper" | "both"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "both",
      "verified": false,
      "badges": [],
      "stats": {
        "matches": 0,
        "rating": 0,
        "completed": 0
      }
    },
    "accessToken": "jwt_token"
  }
}
```

---

### Login User
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt_token"
  }
}
```

---

### Refresh Token
```http
POST /auth/refresh
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

---

### Logout
```http
POST /auth/logout
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

## User Endpoints

### Get Current User
```http
GET /users/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "both",
      "phone": "+33612345678",
      "verified": true,
      "avatarUrl": "https://...",
      "badges": ["premium", "verified"],
      "stats": {
        "matches": 25,
        "rating": 4.8,
        "completed": 20,
        "totalReviews": 18
      }
    }
  }
}
```

---

### Update Current User
```http
PATCH /users/me
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "John Smith",
  "phone": "+33612345678",
  "avatarUrl": "https://..."
}
```

**Response:** `200 OK`

---

## Announcement Endpoints

### Create Announcement
```http
POST /announcements
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "type": "package",
  "title": "Petit colis de livres",
  "from": {
    "city": "Paris",
    "country": "France",
    "coordinates": {
      "lat": 48.8566,
      "lng": 2.3522
    }
  },
  "to": {
    "city": "Lyon",
    "country": "France",
    "coordinates": {
      "lat": 45.7640,
      "lng": 4.8357
    }
  },
  "dateFrom": "2025-01-15",
  "dateTo": "2025-01-20",
  "reward": 50,
  "currency": "EUR",
  "description": "Livres à transporter, environ 2kg",
  "photos": [
    "https://cloudinary.com/..."
  ],
  "weight": 2,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 10
  },
  "premium": false
}
```

**Response:** `201 Created`

---

### Get Announcements (with filters)
```http
GET /announcements?from=Paris&to=Lyon&type=package&page=1&limit=20
```

**Query Parameters:**
- `from` - City name
- `to` - City name
- `dateFrom` - ISO date
- `dateTo` - ISO date
- `type` - "package" | "shopping"
- `minReward` - Number
- `maxReward` - Number
- `premium` - Boolean
- `page` - Number (default: 1)
- `limit` - Number (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": "announcement_id",
        "type": "package",
        "from": { "city": "Paris", "country": "France" },
        "to": { "city": "Lyon", "country": "France" },
        "dateFrom": "2025-01-15",
        "dateTo": "2025-01-20",
        "reward": 50,
        "description": "...",
        "photos": [],
        "premium": false,
        "status": "active",
        "views": 45,
        "userId": {
          "name": "John Doe",
          "avatarUrl": "...",
          "verified": true,
          "stats": { "rating": 4.8 }
        },
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 127,
      "pages": 7
    }
  }
}
```

---

### Get Announcement by ID
```http
GET /announcements/:id
```

**Response:** `200 OK`

---

### Update Announcement
```http
PATCH /announcements/:id
```

**Headers:** `Authorization: Bearer <token>`

**Body:** Same fields as create (partial update allowed)

**Response:** `200 OK`

---

### Delete Announcement
```http
DELETE /announcements/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Trip Endpoints

### Create Trip
```http
POST /trips
```

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "from": {
    "city": "Paris",
    "country": "France",
    "coordinates": {
      "lat": 48.8566,
      "lng": 2.3522
    }
  },
  "to": {
    "city": "Lyon",
    "country": "France",
    "coordinates": {
      "lat": 45.7640,
      "lng": 4.8357
    }
  },
  "dateFrom": "2025-01-15",
  "dateTo": "2025-01-16",
  "availableKg": 10,
  "notes": "Voyage en TGV, flexible sur les horaires"
}
```

**Response:** `201 Created`

---

### Get Trips (with filters)
```http
GET /trips?from=Paris&to=Lyon&minKg=5&page=1&limit=20
```

**Query Parameters:**
- `from` - City name
- `to` - City name
- `dateFrom` - ISO date
- `dateTo` - ISO date
- `minKg` - Number
- `page` - Number
- `limit` - Number

**Response:** `200 OK` (similar structure to announcements)

---

### Get Trip by ID
```http
GET /trips/:id
```

**Response:** `200 OK`

---

### Update Trip
```http
PATCH /trips/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Delete Trip
```http
DELETE /trips/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Matching Endpoints

### Get Matches for Announcement
```http
GET /matches/announcements/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "trip": { /* trip object */ },
        "score": 85
      }
    ]
  }
}
```

Score calculation:
- Location match: 40 points (20 per city)
- Date overlap: 30 points
- User rating: 20 points (rating * 4)
- Verification: 10 points

---

### Get Matches for Trip
```http
GET /matches/trips/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (similar structure)

---

## Chat Endpoints

### Get Conversations
```http
GET /chat/conversations
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conversation_id",
        "participants": [
          { "name": "John", "avatarUrl": "..." },
          { "name": "Jane", "avatarUrl": "..." }
        ],
        "announcementId": "...",
        "tripId": "...",
        "lastMessage": "Hello!",
        "lastMessageAt": "2025-01-10T10:00:00.000Z",
        "createdAt": "2025-01-10T09:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Messages
```http
GET /chat/conversations/:id/messages
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id",
        "conversationId": "...",
        "senderId": {
          "name": "John",
          "avatarUrl": "..."
        },
        "content": "Hello!",
        "attachments": [],
        "read": true,
        "createdAt": "2025-01-10T10:00:00.000Z"
      }
    ]
  }
}
```

---

## WebSocket Events

### Connect
```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
})
```

---

### Join Conversation
```javascript
socket.emit('join-conversation', conversationId)
```

---

### Send Message
```javascript
socket.emit('send-message', {
  conversationId: 'conversation_id',
  content: 'Hello!',
  attachments: []
})
```

---

### Receive Message
```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message)
})
```

---

### Typing Indicator
```javascript
// Send typing status
socket.emit('typing', {
  conversationId: 'conversation_id',
  isTyping: true
})

// Receive typing status
socket.on('user-typing', ({ userId, isTyping }) => {
  console.log(`User ${userId} is typing:`, isTyping)
})
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP

Exceeded rate limit response: `429 Too Many Requests`
