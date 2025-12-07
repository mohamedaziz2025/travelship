'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Star,
  Check,
  X,
  Flag,
  Trash2,
  Edit,
  Archive,
  ArchiveRestore,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface AnnouncementDetails {
  _id: string
  type: 'package' | 'shopping'
  title?: string
  description: string
  from: {
    city: string
    country: string
  }
  to: {
    city: string
    country: string
  }
  dateFrom: string
  dateTo: string
  reward: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  shoppingList?: Array<{ item: string; quantity: number }>
  featured: boolean
  moderationStatus: string
  status: string
  reportCount: number
  user: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
}

export default function AnnouncementDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [announcement, setAnnouncement] = useState<AnnouncementDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    loadAnnouncement()
  }, [isAuthenticated, currentUser, router])

  const loadAnnouncement = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getAnnouncementById(params.id as string)
      setAnnouncement(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
      router.push('/admin/announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!announcement) return
    if (!confirm('Approuver cette annonce ?')) return

    try {
      await adminApi.approveAnnouncement(announcement._id)
      toast.success('Annonce approuvée')
      loadAnnouncement()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleReject = async () => {
    if (!announcement || !rejectionReason.trim()) {
      toast.error('Veuillez indiquer une raison')
      return
    }

    try {
      await adminApi.rejectAnnouncement(announcement._id, rejectionReason)
      toast.success('Annonce rejetée')
      setShowRejectModal(false)
      setRejectionReason('')
      loadAnnouncement()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleToggleFeatured = async () => {
    if (!announcement) return

    try {
      await adminApi.toggleFeaturedAnnouncement(announcement._id)
      toast.success(announcement.featured ? 'Retirée des featured' : 'Ajoutée aux featured')
      loadAnnouncement()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleArchive = async () => {
    if (!announcement) return
    if (!confirm('Archiver cette annonce ?')) return

    try {
      await adminApi.archiveAnnouncement(announcement._id)
      toast.success('Annonce archivée')
      router.push('/admin/announcements')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async () => {
    if (!announcement) return
    if (!confirm('Supprimer définitivement cette annonce ?')) return

    try {
      await adminApi.deleteAnnouncement(announcement._id)
      toast.success('Annonce supprimée')
      router.push('/admin/announcements')
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

  if (!announcement) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <AdminSidebar />

      <main className="flex-1 ml-[280px] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/announcements')}
              className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg hover:bg-[#2d3748] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {announcement.type === 'package' ? (
                  <Package className="w-8 h-8 text-blue-400" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-green-400" />
                )}
                Détails Annonce
              </h1>
              <p className="text-gray-400 mt-1">ID: {announcement._id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {announcement.moderationStatus === 'pending' && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Rejeter
                </button>
              </>
            )}
            <button
              onClick={handleToggleFeatured}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                announcement.featured
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Star className="w-4 h-4" />
              {announcement.featured ? 'Featured' : 'Mettre en avant'}
            </button>
            <button
              onClick={handleArchive}
              className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-all flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archiver
            </button>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">{announcement.title || `Annonce ${announcement.type}`}</h2>
              <p className="text-gray-300 leading-relaxed">{announcement.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Départ</p>
                    <p className="text-white font-medium">{announcement.from.city}, {announcement.from.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Arrivée</p>
                    <p className="text-white font-medium">{announcement.to.city}, {announcement.to.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Dates</p>
                    <p className="text-white font-medium">
                      {new Date(announcement.dateFrom).toLocaleDateString('fr-FR')} - {new Date(announcement.dateTo).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Récompense</p>
                    <p className="text-white font-medium">{announcement.reward}€</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Type Details */}
            {announcement.type === 'package' && announcement.weight && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Détails Colis</h3>
                <div className="space-y-2 text-gray-300">
                  <p>Poids: <span className="text-white font-medium">{announcement.weight} kg</span></p>
                  {announcement.dimensions && (
                    <p>Dimensions: <span className="text-white font-medium">
                      {announcement.dimensions.length}×{announcement.dimensions.width}×{announcement.dimensions.height} cm
                    </span></p>
                  )}
                </div>
              </motion.div>
            )}

            {announcement.type === 'shopping' && announcement.shoppingList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Liste de Shopping</h3>
                <div className="space-y-2">
                  {announcement.shoppingList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg">
                      <span className="text-white">{item.item}</span>
                      <span className="text-gray-400">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Créateur</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{announcement.user.name}</p>
                  <p className="text-gray-400 text-sm">{announcement.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/users/${announcement.user._id}`)}
                className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
              >
                Voir le profil
              </button>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Statuts</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Modération</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    announcement.moderationStatus === 'approved' 
                      ? 'bg-green-500/20 text-green-400'
                      : announcement.moderationStatus === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {announcement.moderationStatus === 'approved' ? 'Approuvée' : 
                     announcement.moderationStatus === 'rejected' ? 'Rejetée' : 'En attente'}
                  </span>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">État</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    announcement.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {announcement.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {announcement.reportCount > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <Flag className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">
                      {announcement.reportCount} signalement{announcement.reportCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1e293b] border border-gray-700 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Rejeter l'annonce</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full h-32 px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Rejeter
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
