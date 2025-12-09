'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { 
  ArrowLeft, 
  Trash2, 
  User, 
  Ban, 
  CheckCircle,
  MessageSquare,
  Clock,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/lib/api'

interface UserType {
  _id: string
  name: string
  email: string
  avatarUrl?: string
  verified?: boolean
}

interface Message {
  _id: string
  senderId: UserType
  content: string
  conversationId: string
  createdAt: string
  updatedAt: string
  read?: boolean
}

interface Conversation {
  _id: string
  participants: UserType[]
  blocked?: boolean
  blockedBy?: UserType
  blockedAt?: string
  createdAt: string
  updatedAt: string
}

export default function ConversationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversation()
    fetchMessages()
  }, [conversationId, page])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversation = async () => {
    try {
      const { data } = await adminApi.getConversationById(conversationId)
      if (data.success) {
        setConversation(data.data)
      }
    } catch (error: any) {
      console.error('Error fetching conversation:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du chargement de la conversation')
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getConversationMessages(conversationId, { page, limit: 50 })
      if (data.success) {
        setMessages(data.data || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des messages')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return

    try {
      const { data } = await adminApi.deleteMessage(messageId)
      if (data.success) {
        toast.success('Message supprimé')
        fetchMessages()
        fetchConversation()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const handleToggleBlock = async () => {
    if (!conversation) return

    try {
      const { data } = await adminApi.toggleConversationBlock(
        conversationId, 
        !conversation.blocked
      )
      if (data.success) {
        toast.success(
          conversation.blocked ? 'Conversation débloquée' : 'Conversation bloquée'
        )
        fetchConversation()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération')
    }
  }

  const handleDeleteConversation = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation et tous ses messages ?')) return

    try {
      const { data } = await adminApi.deleteConversation(conversationId)
      if (data.success) {
        toast.success('Conversation supprimée')
        router.push('/admin/conversations')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  if (!conversation && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8 ml-64">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Conversation non trouvée
              </h2>
              <button
                onClick={() => router.push('/admin/conversations')}
                className="text-blue-600 hover:underline"
              >
                Retour à la liste
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-8 ml-64">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <button
              onClick={() => router.push('/admin/conversations')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux conversations
            </button>

            {conversation && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <MessageSquare className="w-6 h-6 text-blue-500" />
                      <h1 className="text-2xl font-bold text-gray-900">
                        Conversation entre participants
                      </h1>
                      {conversation.blocked && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full flex items-center gap-1">
                          <Ban className="w-4 h-4" />
                          Bloquée
                        </span>
                      )}
                    </div>

                    {/* Participants */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {conversation.participants.map((participant) => (
                        <div key={participant._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {participant.avatarUrl ? (
                            <img
                              src={participant.avatarUrl}
                              alt={participant.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {participant.name}
                              {participant.verified && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{participant.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Créée le {new Date(conversation.createdAt).toLocaleString('fr-FR')}
                      </div>
                      {conversation.blocked && conversation.blockedAt && (
                        <div className="flex items-center gap-2 text-red-600">
                          <Ban className="w-4 h-4" />
                          Bloquée le {new Date(conversation.blockedAt).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleBlock}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        conversation.blocked
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {conversation.blocked ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Débloquer
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" />
                          Bloquer
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDeleteConversation}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages ({messages.length})
                </h2>
              </div>

              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun message dans cette conversation
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      {message.senderId?.avatarUrl ? (
                        <img
                          src={message.senderId.avatarUrl}
                          alt={message.senderId.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {message.senderId?.name || 'Utilisateur supprimé'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-gray-700 break-words">{message.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer ce message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t flex justify-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
