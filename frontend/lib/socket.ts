import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  connect(token: string) {
    if (this.socket?.connected) {
      return
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected')
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected')
    })

    this.socket.on('error', (error: any) => {
      console.error('Socket.io error:', error)
    })

    // Re-attach all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback as any)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback)
      if (this.socket) {
        this.socket.off(event, callback as any)
      }
    } else {
      this.listeners.delete(event)
      if (this.socket) {
        this.socket.off(event)
      }
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected. Cannot emit:', event)
    }
  }

  joinConversation(conversationId: string) {
    this.emit('join-conversation', conversationId)
  }

  leaveConversation(conversationId: string) {
    this.emit('leave-conversation', conversationId)
  }

  sendMessage(conversationId: string, content: string) {
    this.emit('send-message', { conversationId, content })
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    this.emit('typing', { conversationId, isTyping })
  }

  isConnected() {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
