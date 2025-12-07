'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Ban,
  Check,
  Trash2,
  Package,
  Send,
  Edit,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface UserDetails {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  status: string
  country?: string
  city?: string
  verified: boolean
  createdAt: string
  stats: {
    matches: number
    rating: number
    completed: number
  }
}

export default function UserDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    loadUser()
  }, [isAuthenticated, currentUser, router])

  const loadUser = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getUserById(params.id as string)
      setUser(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return
    if (!confirm(`Changer le statut en "${newStatus}" ?`)) return

    try {
      await adminApi.updateUserStatus(user._id, newStatus)
      toast.success('Statut mis à jour')
      loadUser()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return

    try {
      await adminApi.deleteUser(user._id)
      toast.success('Utilisateur supprimé')
      router.push('/admin/users')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white text-lg">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <AdminSidebar />

      <main className="flex-1 ml-[280px] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg hover:bg-[#2d3748] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Détails Utilisateur</h1>
              <p className="text-gray-400 mt-1">ID: {user._id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/admin/users/${user._id}/edit`)}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            
            {user.status === 'active' ? (
              <button
                onClick={() => handleStatusChange('blocked')}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Bloquer
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Activer
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Informations</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Nom</p>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Téléphone</p>
                    <p className="text-white font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.country && (
                <div className="flex items-center gap-4">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Localisation</p>
                    <p className="text-white font-medium">
                      {user.city && `${user.city}, `}{user.country}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Membre depuis</p>
                  <p className="text-white font-medium">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Rôle</p>
                  <div className="flex items-center gap-2 mt-1">
                    {user.role === 'sender' && <Send className="w-4 h-4 text-green-400" />}
                    {user.role === 'shipper' && <Package className="w-4 h-4 text-blue-400" />}
                    <span className="text-white font-medium capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Statistiques</h2>

            <div className="space-y-4">
              <div className="bg-[#0f172a] rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Matchs</p>
                <p className="text-2xl font-bold text-white">{user.stats?.matches || 0}</p>
              </div>

              <div className="bg-[#0f172a] rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Note moyenne</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {(user.stats?.rating || 0).toFixed(1)} ⭐
                </p>
              </div>

              <div className="bg-[#0f172a] rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Complétés</p>
                <p className="text-2xl font-bold text-green-400">{user.stats?.completed || 0}</p>
              </div>
            </div>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Statut du Compte</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border-2 ${
                user.status === 'active' 
                  ? 'bg-green-500/20 border-green-500' 
                  : 'bg-gray-700/20 border-gray-600'
              }`}>
                <p className="text-white font-medium mb-1">Actif</p>
                <p className="text-gray-400 text-sm">Compte en bon état</p>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                user.status === 'blocked' 
                  ? 'bg-red-500/20 border-red-500' 
                  : 'bg-gray-700/20 border-gray-600'
              }`}>
                <p className="text-white font-medium mb-1">Bloqué</p>
                <p className="text-gray-400 text-sm">Accès restreint</p>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                user.verified 
                  ? 'bg-blue-500/20 border-blue-500' 
                  : 'bg-gray-700/20 border-gray-600'
              }`}>
                <p className="text-white font-medium mb-1">Vérifié</p>
                <p className="text-gray-400 text-sm">
                  {user.verified ? 'Email confirmé' : 'En attente'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
