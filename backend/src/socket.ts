import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import Message from './models/message.model'
import Conversation from './models/conversation.model'

interface AuthSocket extends Socket {
  userId?: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const initializeSocket = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
      socket.userId = decoded.id
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`)

    // Join user's personal room
    socket.join(`user:${socket.userId}`)

    // Join conversation
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`User ${socket.userId} joined conversation ${conversationId}`)
    })

    // Leave conversation
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
      console.log(`User ${socket.userId} left conversation ${conversationId}`)
    })

    // Send message
    socket.on('send-message', async (data: {
      conversationId: string
      content: string
      attachments?: string[]
    }) => {
      try {
        const conversation = await Conversation.findById(data.conversationId)

        if (!conversation) {
          socket.emit('error', { message: 'Conversation non trouvée' })
          return
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.userId
        )

        if (!isParticipant) {
          socket.emit('error', { message: 'Non autorisé' })
          return
        }

        // Create message
        const message = await Message.create({
          conversationId: data.conversationId,
          senderId: socket.userId,
          content: data.content,
        })

        const populatedMessage = await Message.findById(message._id).populate('senderId', 'name avatarUrl')

        // Update conversation
        conversation.lastMessage = {
          content: data.content,
          senderId: new mongoose.Types.ObjectId(socket.userId!),
          timestamp: new Date(),
        }
        await conversation.save()

        // Emit to conversation room
        io.to(`conversation:${data.conversationId}`).emit('new-message', populatedMessage)

        // Emit to recipient's personal room for notifications
        const recipientId = conversation.participants.find(
          (p) => p.toString() !== socket.userId
        )
        io.to(`user:${recipientId}`).emit('new-notification', {
          type: 'message',
          conversationId: data.conversationId,
          message: populatedMessage,
        })
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' })
      }
    })

    // Typing indicator
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })

  console.log('✅ Socket.io initialized')
}
