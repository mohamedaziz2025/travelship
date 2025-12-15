import express, { Application } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import announcementRoutes from './routes/announcement.routes'
import tripRoutes from './routes/trip.routes'
import matchingRoutes from './routes/matching.routes'
import chatRoutes from './routes/chat.routes'
import conversationRoutes from './routes/conversation.routes'
import adminRoutes from './routes/admin.routes'
import adminRoutesV2 from './routes/admin.routes.v2'
import alertRoutes from './routes/alert.routes'
import { initializeSocket } from './socket'
import { seedAdminUser } from './utils/seedAdmin'
import { verifyEmailConnection } from './config/email'

dotenv.config()

const app: Application = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1'
app.use(`/api/${API_VERSION}/auth`, authRoutes)
app.use(`/api/${API_VERSION}/users`, userRoutes)
app.use(`/api/${API_VERSION}/announcements`, announcementRoutes)
app.use(`/api/${API_VERSION}/trips`, tripRoutes)
app.use(`/api/${API_VERSION}/matches`, matchingRoutes)
app.use(`/api/${API_VERSION}/chat`, chatRoutes)
app.use(`/api/${API_VERSION}/conversations`, conversationRoutes)
app.use(`/api/${API_VERSION}/admin`, adminRoutesV2)
app.use(`/api/${API_VERSION}/alerts`, alertRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Socket.io
initializeSocket(io)

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelship'

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected successfully')
    
    // Verify email service
    await verifyEmailConnection()
    
    // Seed admin user
    await seedAdminUser()
    
    const PORT = process.env.PORT || 5000
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 Socket.io server ready`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    })
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  })

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed')
      process.exit(0)
    })
  })
})

export { app, io }
