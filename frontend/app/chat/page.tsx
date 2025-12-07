'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageCircle, Send, ArrowLeft, Check, CheckCheck, Archive, Trash2, MoreVertical } from 'lucide-react'
import { conversationsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { socketService } from '@/lib/socket'
import toast from 'react-hot-toast'

interface Conversation {
  _id: string
  participants: any[]
  lastMessage?: {
    content: string
    senderId: string
    timestamp: Date
  }
  archivedBy?: string[]
  deletedBy?: string[]
  createdAt: Date
  updatedAt: Date
}

interface Message {
  _id: string
  conversationId?: string
  senderId: any
  content: string
  read: boolean
  createdAt: Date
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  // Initialize Socket.io
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken')
      if (token) {
        socketService.connect(token)
      }

      // Listen for new messages
      socketService.on('new-message', handleNewMessage)
      socketService.on('user-typing', handleUserTyping)

      return () => {
        socketService.off('new-message', handleNewMessage)
        socketService.off('user-typing', handleUserTyping)
      }
    }
  }, [user])

  // Handle contact from query params
  useEffect(() => {
    if (!user) {
      toast.error('Vous devez être connecté')
      router.push('/login')
      return
    }

    const userId = searchParams.get('userId')
    if (userId && userId !== user.id) {
      createOrGetConversation(userId)
    } else {
      loadConversations()
    }
  }, [user, searchParams])

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id)
      socketService.joinConversation(selectedConversation._id)
      
      // Mark messages as read
      conversationsApi.markAsRead(selectedConversation._id).catch(console.error)

      return () => {
        socketService.leaveConversation(selectedConversation._id)
      }
    }
  }, [selectedConversation?._id])

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleNewMessage = (message: Message) => {
    if (message.conversationId === selectedConversation?._id) {
      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some((m) => m._id === message._id)
        if (exists) {
          return prev
        }
        
        // Check if it's from the current user (already added optimistically)
        const senderId = message.senderId?._id || message.senderId
        if (senderId === user?.id) {
          // Don't add again, it was already added optimistically
          return prev
        }
        
        return [...prev, message]
      })
    }
    
    // Update conversation list
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === message.conversationId
          ? {
              ...conv,
              lastMessage: {
                content: message.content,
                senderId: message.senderId._id || message.senderId,
                timestamp: new Date(message.createdAt),
              },
            }
          : conv
      )
    )
  }

  const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
    setTypingUsers((prev) => {
      const next = new Set(prev)
      if (data.isTyping) {
        next.add(data.userId)
      } else {
        next.delete(data.userId)
      }
      return next
    })
  }

  const createOrGetConversation = async (participantId: string) => {
    try {
      setLoading(true)
      const response = await conversationsApi.create(participantId)
      
      if (response.data.success) {
        const conversation = response.data.data
        setSelectedConversation(conversation)
        
        // Add to conversations list if not already there
        setConversations((prev) => {
          const exists = prev.some((c) => c._id === conversation._id)
          return exists ? prev : [conversation, ...prev]
        })
        
        // Remove userId from URL
        router.replace('/chat', { scroll: false })
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la conversation')
    } finally {
      setLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await conversationsApi.getAll()
      
      if (response.data.success) {
        setConversations(response.data.data)
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des conversations')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await conversationsApi.getMessages(conversationId)
      
      if (response.data.success) {
        setMessages(response.data.data)
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des messages')
      console.error(error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedConversation || sending) return

    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}`
    setNewMessage('')
    setSending(true)

    try {
      // Optimistically add the message to the UI first
      const optimisticMessage: Message = {
        _id: tempId,
        conversationId: selectedConversation._id,
        senderId: { _id: user!.id, name: user!.name },
        content: messageContent,
        read: false,
        createdAt: new Date(),
      }
      
      setMessages((prev) => [...prev, optimisticMessage])
      
      // Send via HTTP API to save in database
      const response = await conversationsApi.sendMessage(selectedConversation._id, messageContent)
      
      if (response.data.success) {
        const realMessage = response.data.data
        
        // Replace temporary message with real one
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? realMessage : m))
        )
        
        // Notify via Socket.io for real-time delivery to other participants
        socketService.sendMessage(selectedConversation._id, messageContent)
        
        // Update conversation in list
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === selectedConversation._id
              ? {
                  ...conv,
                  lastMessage: {
                    content: messageContent,
                    senderId: user!.id,
                    timestamp: new Date(),
                  },
                }
              : conv
          )
        )
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message')
      // Remove failed message
      setMessages((prev) => prev.filter((m) => m._id !== tempId))
      setNewMessage(messageContent) // Restore message
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (isTyping: boolean) => {
    if (selectedConversation) {
      socketService.sendTyping(selectedConversation._id, isTyping)
    }
  }

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await conversationsApi.archive(conversationId)
      setConversations((prev) => prev.filter((c) => c._id !== conversationId))
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null)
      }
      toast.success('Conversation archivée')
    } catch (error: any) {
      toast.error('Erreur lors de l\'archivage')
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      return
    }

    try {
      await conversationsApi.delete(conversationId)
      setConversations((prev) => prev.filter((c) => c._id !== conversationId))
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null)
      }
      toast.success('Conversation supprimée')
    } catch (error: any) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participants.find((p: any) => p._id !== user?.id)
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffTime = now.getTime() - messageDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Aujourd\'hui'
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    
    return messageDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-dark/20 mb-3 animate-pulse" />
          <p className="text-dark/60">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light py-20">
      <div className="container h-[calc(100vh-120px)]">
        <div className="card h-full flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-light-darker overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-light-darker">
              <h2 className="text-xl font-bold">Messages</h2>
              {socketService.isConnected() && (
                <p className="text-xs text-green-600 mt-1">● En ligne</p>
              )}
            </div>

            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-dark/20 mb-3" />
                <p className="text-dark/60">Aucune conversation</p>
                <p className="text-xs text-dark/40 mt-2">
                  Contactez quelqu'un pour démarrer une conversation
                </p>
              </div>
            ) : (
              <div>
                {conversations.map((conv) => {
                  const otherUser = getOtherUser(conv)
                  const isSelected = selectedConversation?._id === conv._id
                  
                  return (
                    <div
                      key={conv._id}
                      className={`group relative border-b border-light-darker ${
                        isSelected ? 'bg-light-darker' : ''
                      }`}
                    >
                      <button
                        onClick={() => setSelectedConversation(conv)}
                        className="w-full p-4 text-left hover:bg-light-darker transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                              {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate">{otherUser?.name || 'Utilisateur'}</p>
                              {conv.lastMessage && (
                                <p className="text-xs text-dark/40">
                                  {formatDate(conv.lastMessage.timestamp)}
                                </p>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className="text-sm text-dark/60 truncate">
                                {conv.lastMessage.senderId === user?.id && 'Vous: '}
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {/* Actions menu */}
                      <div className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArchiveConversation(conv._id)
                            }}
                            className="p-2 hover:bg-dark/10 rounded-lg transition-colors"
                            title="Archiver"
                          >
                            <Archive className="w-4 h-4 text-dark/60" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteConversation(conv._id)
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-light-darker flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden -ml-2 p-2 hover:bg-light-darker rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    {getOtherUser(selectedConversation)?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{getOtherUser(selectedConversation)?.name || 'Utilisateur'}</p>
                    {typingUsers.size > 0 && (
                      <p className="text-xs text-accent">En train d'écrire...</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-dark/40">Aucun message pour le moment</p>
                      <p className="text-sm text-dark/30 mt-1">Envoyez le premier message !</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isOwnMessage = message.senderId._id === user?.id || message.senderId === user?.id
                      const showDate =
                        index === 0 ||
                        new Date(messages[index - 1].createdAt).toDateString() !==
                          new Date(message.createdAt).toDateString()

                      return (
                        <div key={message._id}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="text-xs text-dark/40 bg-light-darker px-3 py-1 rounded-full">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-gradient-primary text-white'
                                  : 'bg-light-darker text-dark'
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isOwnMessage ? 'text-white/70' : 'text-dark/40'
                              }`}>
                                <span>{formatTime(message.createdAt)}</span>
                                {isOwnMessage && (
                                  message.read ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-light-darker">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onFocus={() => handleTyping(true)}
                      onBlur={() => handleTyping(false)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 input-field"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                      {sending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto text-dark/20 mb-4" />
                  <p className="text-dark/60 font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm text-dark/40 mt-1">
                    Choisissez une conversation dans la liste pour commencer
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
