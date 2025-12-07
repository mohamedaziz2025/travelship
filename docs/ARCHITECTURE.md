# 🏗️ Architecture Technique TravelShip

## 📊 Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Browser   │  │   Mobile   │  │   Tablet   │            │
│  │   Chrome   │  │   Safari   │  │   iPad     │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
└────────┼────────────────┼────────────────┼───────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
                          │ HTTPS
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ App Router  │  React Components  │  Tailwind CSS      │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ TanStack Query  │  Zustand  │  Socket.io-client       │  │
│  └────────────────────────────────────────────────────────┘  │
│              │                                 │              │
│         HTTP REST                         WebSocket           │
└──────────────┼─────────────────────────────────┼─────────────┘
               │                                 │
               ▼                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Routes  │  Controllers  │  Services  │  Middleware    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  JWT Auth  │  Validation  │  Rate Limit  │  CORS       │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │         Socket.io Server (Real-time Chat)              │  │
│  └────────────────────────────────────────────────────────┘  │
│              │                    │                │          │
│         Mongoose              BullMQ          Cloudinary      │
└──────────────┼────────────────────┼────────────────┼─────────┘
               │                    │                │
               ▼                    ▼                ▼
┌─────────────────┐    ┌─────────────────┐   ┌──────────────┐
│  MongoDB Atlas  │    │  Redis Cloud    │   │  Cloudinary  │
│   (Database)    │    │  (Jobs/Cache)   │   │   (Images)   │
└─────────────────┘    └─────────────────┘   └──────────────┘
```

---

## 🎯 Stack Technique Détaillé

### Frontend

#### Framework & Language
- **Next.js 14** - Framework React avec App Router
  - SSR (Server-Side Rendering)
  - SSG (Static Site Generation)
  - Route handlers
  - Middleware
  - Image optimization
  
- **TypeScript** - Type safety
  - Interfaces pour tous les modèles
  - Type checking strict
  - IntelliSense amélioré

#### Styling
- **Tailwind CSS 3.4** - Utility-first CSS
  - Custom design tokens
  - Responsive design
  - Dark mode ready
  
- **Shadcn UI** - Component library
  - Accessible components
  - Customizable
  - Headless UI primitives

#### State Management
- **Zustand** - Lightweight state management
  - User authentication state
  - UI state (sidebar, modals)
  - Persistent storage
  
- **TanStack Query** - Server state management
  - Data fetching
  - Caching
  - Background updates
  - Optimistic updates

#### Real-time
- **Socket.io-client** - WebSocket client
  - Chat messages
  - Typing indicators
  - Notifications
  - Presence status

#### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

#### Icons & Animations
- **Lucide React** - Icon library
- **Framer Motion** - Animations (optional)

---

### Backend

#### Framework & Language
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety

#### Database
- **MongoDB** - NoSQL database
  - Flexible schema
  - Scalable
  - Geospatial queries
  
- **Mongoose** - ODM (Object Document Mapper)
  - Schema validation
  - Middleware hooks
  - Population
  - Virtuals

#### Authentication
- **JWT (JSON Web Tokens)**
  - Access tokens (15min)
  - Refresh tokens (7 days)
  - HttpOnly cookies
  
- **bcryptjs** - Password hashing
  - Salt rounds: 10
  - Secure hashing

#### Real-time
- **Socket.io** - WebSocket server
  - Room management
  - Event broadcasting
  - Authentication middleware
  - Namespace support

#### Jobs & Queue
- **BullMQ** - Job queue
  - Email sending
  - Image processing
  - Scheduled tasks
  - Retry logic
  
- **Redis** - In-memory store
  - Job queue storage
  - Session storage
  - Caching

#### Security
- **Helmet** - Security headers
- **CORS** - Cross-Origin Resource Sharing
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

#### File Upload
- **Multer** - Multipart/form-data
- **Cloudinary** - Cloud storage
  - Image upload
  - Transformation
  - CDN delivery

#### Email
- **Nodemailer** - Email sending
  - Welcome emails
  - Password reset
  - Notifications

---

## 🗄️ Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum['sender', 'shipper', 'both', 'admin'],
  phone: String,
  verified: Boolean,
  avatarUrl: String,
  badges: [String],
  stats: {
    matches: Number,
    rating: Number,
    completed: Number,
    totalReviews: Number
  },
  refreshTokens: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email: 1` (unique)
- `createdAt: -1`

---

#### announcements
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  type: Enum['package', 'shopping'],
  title: String,
  from: {
    city: String (indexed),
    country: String,
    coordinates: { lat: Number, lng: Number }
  },
  to: {
    city: String (indexed),
    country: String,
    coordinates: { lat: Number, lng: Number }
  },
  dateFrom: Date (indexed),
  dateTo: Date (indexed),
  reward: Number,
  currency: String,
  description: String,
  photos: [String],
  weight: Number,
  dimensions: { length, width, height },
  premium: Boolean,
  status: Enum['active', 'matched', 'completed', 'cancelled'] (indexed),
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ 'from.city': 1, 'to.city': 1 }` (compound)
- `{ dateFrom: 1, dateTo: 1 }` (compound)
- `status: 1`
- `userId: 1`

---

#### trips
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  from: {
    city: String (indexed),
    country: String,
    coordinates: { lat, lng }
  },
  to: {
    city: String (indexed),
    country: String,
    coordinates: { lat, lng }
  },
  dateFrom: Date (indexed),
  dateTo: Date (indexed),
  availableKg: Number,
  notes: String,
  status: Enum['active', 'completed', 'cancelled'] (indexed),
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ 'from.city': 1, 'to.city': 1 }` (compound)
- `{ dateFrom: 1, dateTo: 1 }` (compound)
- `status: 1`
- `userId: 1`

---

#### conversations
```javascript
{
  _id: ObjectId,
  participants: [ObjectId] (ref: User, length: 2, indexed),
  announcementId: ObjectId (ref: Announcement),
  tripId: ObjectId (ref: Trip),
  lastMessage: String,
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `participants: 1`

---

#### messages
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversation, indexed),
  senderId: ObjectId (ref: User),
  content: String,
  attachments: [String],
  read: Boolean,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes:**
- `{ conversationId: 1, createdAt: -1 }` (compound)

---

## 🔐 Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /auth/register
     │    { email, password, name }
     ▼
┌──────────────────┐
│  Auth Controller │
└────┬─────────────┘
     │
     │ 2. Hash password
     │ 3. Create user
     │ 4. Generate JWT tokens
     │    - Access token (15min)
     │    - Refresh token (7 days)
     │
     ▼
┌─────────────┐
│   MongoDB   │
└─────────────┘
     │
     │ 5. Return tokens
     │    - Access token in response
     │    - Refresh token in httpOnly cookie
     ▼
┌──────────┐
│  Client  │
│  Stores  │
│  Access  │
│  Token   │
└────┬─────┘
     │
     │ 6. Subsequent requests
     │    Authorization: Bearer <access_token>
     ▼
┌──────────────────┐
│  Auth Middleware │
│  Verify JWT      │
└────┬─────────────┘
     │
     │ 7. Token valid? → Continue
     │    Token expired? → 401 Unauthorized
     │
     ▼
┌──────────┐
│  Client  │
│  Calls   │
│  /refresh│
└────┬─────┘
     │
     │ 8. POST /auth/refresh
     │    Cookie: refreshToken=...
     ▼
┌──────────────────┐
│  Verify Refresh  │
│  Generate New    │
│  Access Token    │
└────┬─────────────┘
     │
     │ 9. Return new access token
     ▼
┌──────────┐
│  Client  │
│  Updates │
│  Token   │
└──────────┘
```

---

## 📡 Real-time Chat Architecture

```
┌─────────────┐                 ┌─────────────┐
│  Client A   │                 │  Client B   │
└──────┬──────┘                 └──────┬──────┘
       │                               │
       │ 1. Connect with JWT           │
       │ io.connect({ auth: token })   │
       ▼                               ▼
┌──────────────────────────────────────────────┐
│         Socket.io Server                      │
│  ┌────────────────────────────────────────┐  │
│  │  Auth Middleware: Verify JWT           │  │
│  └────────────────────────────────────────┘  │
│                    │                          │
│  ┌─────────────────┼──────────────────────┐  │
│  │  socket.userId = decoded.id            │  │
│  │  socket.join(`user:${userId}`)         │  │
│  └────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
┌──────────────┐      ┌──────────────┐
│ Room:        │      │ Room:        │
│ user:123     │      │ user:456     │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │ 2. Join conversation
       │ emit('join-conversation', convId)
       ▼
┌──────────────────────────────┐
│ Room: conversation:abc123    │
│  - socket_A (user:123)       │
│  - socket_B (user:456)       │
└──────────────────────────────┘
       │
       │ 3. Send message
       │ emit('send-message', { conversationId, content })
       ▼
┌──────────────────────────────────────┐
│  1. Save to MongoDB                  │
│  2. Emit to conversation room        │
│     io.to(`conversation:abc123`)     │
│       .emit('new-message', message)  │
│  3. Emit notification to recipient   │
│     io.to(`user:456`)                │
│       .emit('new-notification', ...) │
└──────────────────────────────────────┘
```

---

## 🎯 Matching Algorithm

```typescript
function calculateMatchScore(announcement, trip): number {
  let score = 0
  
  // 1. Location Match (40 points)
  if (announcement.from.city === trip.from.city) {
    score += 20
  }
  if (announcement.to.city === trip.to.city) {
    score += 20
  }
  
  // 2. Date Overlap (30 points)
  const announcementStart = announcement.dateFrom
  const announcementEnd = announcement.dateTo
  const tripStart = trip.dateFrom
  const tripEnd = trip.dateTo
  
  if (tripStart <= announcementEnd && tripEnd >= announcementStart) {
    score += 30
  }
  
  // 3. User Rating (20 points)
  if (trip.userId.stats.rating) {
    score += Math.min(trip.userId.stats.rating * 4, 20)
  }
  
  // 4. Verification Status (10 points)
  if (trip.userId.verified) {
    score += 10
  }
  
  return Math.min(score, 100)
}
```

**Score Interpretation:**
- `90-100`: Excellent match
- `70-89`: Good match
- `50-69`: Possible match
- `< 50`: Poor match

---

## 🚀 Performance Optimizations

### Frontend
1. **Code Splitting** - Next.js dynamic imports
2. **Image Optimization** - Next.js Image component
3. **Lazy Loading** - React.lazy for components
4. **Caching** - TanStack Query with stale-while-revalidate
5. **Debouncing** - Search inputs
6. **Memoization** - useMemo, useCallback

### Backend
1. **Database Indexing** - Compound indexes for searches
2. **Connection Pooling** - MongoDB connection pool
3. **Caching** - Redis for frequently accessed data
4. **Pagination** - Limit results per page
5. **Compression** - gzip compression
6. **Rate Limiting** - Prevent abuse

---

## 🔒 Security Measures

### Authentication
- JWT with short expiration (15min)
- Refresh tokens in httpOnly cookies
- Password hashing with bcrypt (10 rounds)
- CSRF protection

### API Security
- Helmet.js for security headers
- CORS configured for specific origins
- Rate limiting (100 req/15min)
- Input validation with Zod
- SQL injection prevention (Mongoose)
- XSS protection

### Data Security
- MongoDB authentication
- Redis password protection
- Environment variables for secrets
- HTTPS enforced in production

---

## 📊 Scalability Considerations

### Horizontal Scaling
- Stateless backend (scale instances)
- Redis for shared session storage
- MongoDB sharding capability
- CDN for static assets

### Vertical Scaling
- Increase server resources
- Database connection pool size
- Redis memory allocation

### Monitoring
- Application logging
- Error tracking (Sentry)
- Performance monitoring
- Database query analysis

---

Cette architecture assure:
✅ **Haute performance**
✅ **Sécurité robuste**
✅ **Scalabilité**
✅ **Maintenabilité**
✅ **Expérience utilisateur optimale**
