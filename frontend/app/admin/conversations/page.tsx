'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { MessageSquare, Trash2, Ban, Eye, Search, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { adminApi } from '@/lib/api'

interface User {
  _id: string
  name: string
  email: string
  avatarUrl?: string
}

interface Conversation {
  _id: string
  participants: User[]
  lastMessage?: {
    content: string
    timestamp: Date
  }
  blocked?: boolean
  blockedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBlocked, setFilterBlocked] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    active: 0,
  })

  useEffect(() => {
    fetchConversations()
  }, [page, filterBlocked])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 20 }
      
      if (filterBlocked !== 'all') {
        params.blocked = filterBlocked === 'blocked'
      }

      const { data } = await adminApi.getConversations(params)
      console.log('Conversations API Response:', data)
      
      if (data.success) {
        setConversations(data.data || [])
        setTotalPages(data.pagination?.pages || 1)
        
        // Calculate stats
        const total = data.pagination?.total || 0
        const blocked = data.data?.filter((c: Conversation) => c.blocked).length || 0
        setStats({
          total,
          blocked,
          active: total - blocked,
        })
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) return

    try {
      const { data } = await adminApi.deleteConversation(id)
      if (data.success) {
        toast.success('Conversation supprimée')
        fetchConversations()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const handleToggleBlock = async (id: string, currentBlocked: boolean) => {
    try {
      const { data } = await adminApi.toggleConversationBlock(id, !currentBlocked)
      if (data.success) {
        toast.success(currentBlocked ? 'Conversation débloquée' : 'Conversation bloquée')
        fetchConversations()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération')
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true
    if (!conv.participants || conv.participants.length === 0) return false
    return conv.participants.some(
      (p) =>
        p && p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p && p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-8 ml-64">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Conversations
              </h1>
              <p className="text-gray-600">
                Surveillez et gérez les conversations entre utilisateurs
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Conversations
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Conversations Actives
                    </p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Conversations Bloquées
                    </p>
                    <p className="text-3xl font-bold text-red-600">{stats.blocked}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Statut:</label>
                  <select
                    value={filterBlocked}
                    onChange={(e) => {
                      setFilterBlocked(e.target.value)
                      setPage(1)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toutes</option>
                    <option value="active">Actives</option>
                    <option value="blocked">Bloquées</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversations List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                          <div className="flex items-center gap-2">
                            {conversation.participants.map((participant, idx) => (
                              <div key={participant._id}>
                                <span className="font-medium text-gray-900">
                                  {participant.name}
                                </span>
                                {idx < conversation.participants.length - 1 && (
                                  <span className="text-gray-400 mx-2">↔</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {conversation.blocked && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              Bloquée
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          {conversation.participants.map((p) => p.email).join(' • ')}
                        </div>

                        {conversation.lastMessage && (
                          <div className="text-sm text-gray-500 bg-gray-50 rounded p-2 mb-2">
                            <strong>Dernier message:</strong> {conversation.lastMessage.content}
                            <span className="text-xs text-gray-400 ml-2">
                              {new Date(conversation.lastMessage.timestamp).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-gray-400">
                          Créée le {new Date(conversation.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/admin/conversations/${conversation._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les messages"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>

                        <button
                          onClick={() => handleToggleBlock(conversation._id, conversation.blocked || false)}
                          className={`p-2 rounded-lg transition-colors ${
                            conversation.blocked
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                          title={conversation.blocked ? 'Débloquer' : 'Bloquer'}
                        >
                          {conversation.blocked ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Ban className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteConversation(conversation._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredConversations.length === 0 && !loading && (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Aucune conversation trouvée
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'Aucune conversation ne correspond à votre recherche'
                        : 'Il n\'y a pas encore de conversations entre les utilisateurs'
                      }
                    </p>
                    <p className="text-sm text-gray-400">
                      Total de conversations dans la base : {conversations.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 bg-white rounded-lg shadow-sm">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
