'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  Package,
  ShoppingBag,
  Clock,
  AlertCircle,
  Eye,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DataTable from '@/components/admin/DataTable'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Announcement {
  _id: string
  userId: { _id: string; name: string; email: string }
  type: 'package' | 'shopping'
  title?: string
  from: { city: string; country: string }
  to: { city: string; country: string }
  dateFrom: string
  dateTo: string
  moderationStatus: 'pending' | 'approved' | 'rejected'
  status: string
  featured: boolean
  reportCount: number
  createdAt: string
}

export default function AnnouncementsManagement() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    moderationStatus: 'all',
    status: 'all',
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadAnnouncements()
  }, [pagination.page, filters])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (filters.search) params.search = filters.search
      if (filters.type !== 'all') params.type = filters.type
      if (filters.moderationStatus !== 'all') params.moderationStatus = filters.moderationStatus
      if (filters.status !== 'all') params.status = filters.status

      const { data } = await adminApi.getAnnouncements(params)
      setAnnouncements(data.data)
      setPagination(data.pagination)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveAnnouncement(id)
      toast.success('Annonce approuvée')
      loadAnnouncements()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Raison du rejet:')
    if (!reason) return

    try {
      await adminApi.rejectAnnouncement(id, reason)
      toast.success('Annonce rejetée')
      loadAnnouncements()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      await adminApi.featureAnnouncement(id, !featured)
      toast.success(featured ? 'Retirée de la mise en avant' : 'Mise en avant')
      loadAnnouncements()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return

    try {
      await adminApi.deleteAnnouncement(id)
      toast.success('Annonce supprimée')
      loadAnnouncements()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (ann: Announcement) => (
        <div className="flex items-center gap-2">
          {ann.type === 'package' ? (
            <Package className="w-5 h-5 text-blue-400" />
          ) : (
            <ShoppingBag className="w-5 h-5 text-green-400" />
          )}
          <span className="text-sm capitalize">{ann.type === 'package' ? 'Colis' : 'Achat'}</span>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Utilisateur',
      render: (ann: Announcement) => (
        <div>
          <div className="font-medium text-white">{ann.userId?.name || 'N/A'}</div>
          <div className="text-sm text-gray-400">{ann.userId?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'route',
      label: 'Trajet',
      render: (ann: Announcement) => (
        <div className="text-sm">
          <div className="text-white">{ann.from.city} → {ann.to.city}</div>
          <div className="text-gray-400 text-xs">{ann.from.country} → {ann.to.country}</div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (ann: Announcement) => (
        <div className="text-sm text-gray-400">
          {new Date(ann.dateFrom).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          {' - '}
          {new Date(ann.dateTo).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
        </div>
      ),
    },
    {
      key: 'moderationStatus',
      label: 'Modération',
      render: (ann: Announcement) => (
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${ann.moderationStatus === 'pending' ? 'bg-orange-500/20 text-orange-400' : ''}
          ${ann.moderationStatus === 'approved' ? 'bg-green-500/20 text-green-400' : ''}
          ${ann.moderationStatus === 'rejected' ? 'bg-red-500/20 text-red-400' : ''}
        `}>
          {ann.moderationStatus === 'pending' ? 'En attente' : 
           ann.moderationStatus === 'approved' ? 'Approuvée' : 'Rejetée'}
        </span>
      ),
    },
    {
      key: 'featured',
      label: 'En avant',
      render: (ann: Announcement) => (
        ann.featured ? <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : null
      ),
    },
    {
      key: 'reports',
      label: 'Signalements',
      render: (ann: Announcement) => (
        ann.reportCount > 0 ? (
          <div className="flex items-center gap-1 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{ann.reportCount}</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (ann: Announcement) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/announcements/${ann._id}`)}
            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {ann.moderationStatus === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(ann._id)}
                className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                title="Approuver"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(ann._id)}
                className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                title="Rejeter"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => handleFeature(ann._id, ann.featured)}
            className={`p-2 rounded-lg transition-colors ${
              ann.featured
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                : 'hover:bg-gray-700 text-gray-400'
            }`}
            title={ann.featured ? 'Retirer mise en avant' : 'Mettre en avant'}
          >
            <Star className={`w-4 h-4 ${ann.featured ? 'fill-yellow-400' : ''}`} />
          </button>
          
          <button
            onClick={() => handleDelete(ann._id)}
            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <AdminSidebar />

      <main className="flex-1 ml-[280px] p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Gestion des Annonces
          </h1>
          <p className="text-gray-400">{pagination.total} annonces au total</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-4"
        >
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="package">Colis</option>
            <option value="shopping">Achats</option>
          </select>

          <select
            value={filters.moderationStatus}
            onChange={(e) => setFilters({ ...filters, moderationStatus: e.target.value })}
            className="px-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes modérations</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les status</option>
            <option value="active">Actives</option>
            <option value="matched">Matchées</option>
            <option value="completed">Complétées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={announcements}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            onSearch={(query) => setFilters({ ...filters, search: query })}
            searchPlaceholder="Rechercher une annonce..."
            loading={loading}
          />
        </motion.div>
      </main>
    </div>
  )
}
