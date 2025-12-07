'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Image as ImageIcon,
  User,
  FileText,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DataTable from '@/components/admin/DataTable'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Report {
  _id: string
  reportedBy: { _id: string; name: string; email: string }
  reportedUser?: { _id: string; name: string; email: string }
  announcement?: { _id: string; title?: string; type: string }
  trip?: { _id: string; from: any; to: any }
  reason: string
  description: string
  proofs: string[]
  status: 'pending' | 'reviewed' | 'closed' | 'rejected'
  actionTaken?: string
  createdAt: string
}

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  inappropriate_content: 'Contenu inapproprié',
  fraud: 'Fraude',
  scam: 'Arnaque',
  fake_profile: 'Faux profil',
  harassment: 'Harcèlement',
  violence: 'Violence',
  illegal_items: 'Objets illégaux',
  other: 'Autre',
}

export default function ReportsManagement() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending',
    reason: 'all',
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadReports()
  }, [pagination.page, filters])

  const loadReports = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (filters.status !== 'all') params.status = filters.status
      if (filters.reason !== 'all') params.reason = filters.reason

      const { data } = await adminApi.getReports(params)
      setReports(data.data)
      setPagination(data.pagination)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async (reportId: string) => {
    const reviewNotes = prompt('Notes de révision (optionnel):')
    
    try {
      await adminApi.closeReport(reportId, {
        reviewNotes,
        actionTaken: 'none',
      })
      toast.success('Signalement fermé')
      loadReports()
      setShowModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDeletePost = async (reportId: string) => {
    if (!confirm('Supprimer la publication signalée ?')) return

    try {
      await adminApi.deleteReportedPost(reportId)
      toast.success('Publication supprimée et signalement fermé')
      loadReports()
      setShowModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleBanUser = async (report: Report) => {
    if (!report.reportedUser) {
      toast.error('Aucun utilisateur signalé')
      return
    }

    if (!confirm(`Bannir l'utilisateur ${report.reportedUser.name} ?`)) return

    try {
      await adminApi.blockUser(report.reportedUser._id, 'Signalement: ' + report.reason)
      await adminApi.closeReport(report._id, {
        reviewNotes: 'Utilisateur banni',
        actionTaken: 'user_banned',
      })
      toast.success('Utilisateur banni et signalement fermé')
      loadReports()
      setShowModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const columns = [
    {
      key: 'reporter',
      label: 'Signalé par',
      render: (report: Report) => (
        <div>
          <div className="font-medium text-white">{report.reportedBy?.name || 'N/A'}</div>
          <div className="text-sm text-gray-400">{report.reportedBy?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'target',
      label: 'Cible',
      render: (report: Report) => (
        <div className="text-sm">
          {report.reportedUser && (
            <div className="flex items-center gap-2 text-red-400">
              <User className="w-4 h-4" />
              {report.reportedUser.name}
            </div>
          )}
          {report.announcement && (
            <div className="flex items-center gap-2 text-blue-400">
              <FileText className="w-4 h-4" />
              {report.announcement.title || `Annonce ${report.announcement.type}`}
            </div>
          )}
          {report.trip && (
            <div className="flex items-center gap-2 text-green-400">
              <FileText className="w-4 h-4" />
              Trajet
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Motif',
      render: (report: Report) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
          {reasonLabels[report.reason] || report.reason}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (report: Report) => (
        <div className="text-sm text-gray-300 max-w-xs truncate">
          {report.description}
        </div>
      ),
    },
    {
      key: 'proofs',
      label: 'Preuves',
      render: (report: Report) => (
        report.proofs.length > 0 ? (
          <div className="flex items-center gap-1 text-blue-400">
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">{report.proofs.length}</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (report: Report) => (
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${report.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : ''}
          ${report.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' : ''}
          ${report.status === 'closed' ? 'bg-green-500/20 text-green-400' : ''}
          ${report.status === 'rejected' ? 'bg-red-500/20 text-red-400' : ''}
        `}>
          {report.status === 'pending' ? 'En attente' : 
           report.status === 'reviewed' ? 'Révisé' :
           report.status === 'closed' ? 'Fermé' : 'Rejeté'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (report: Report) => (
        <span className="text-sm text-gray-400">
          {new Date(report.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (report: Report) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/reports/${report._id}`)}
            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setSelectedReport(report)
              setShowModal(true)
            }}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
            title="Aperçu rapide"
          >
            <FileText className="w-4 h-4" />
          </button>
          
          {report.status === 'pending' && (
            <>
              <button
                onClick={() => handleClose(report._id)}
                className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                title="Fermer"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              
              {(report.announcement || report.trip) && (
                <button
                  onClick={() => handleDeletePost(report._id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                  title="Supprimer publication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
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
            <AlertTriangle className="w-8 h-8 text-red-400" />
            Gestion des Signalements
          </h1>
          <p className="text-gray-400">{pagination.total} signalements au total</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-4"
        >
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les status</option>
            <option value="pending">En attente</option>
            <option value="reviewed">Révisés</option>
            <option value="closed">Fermés</option>
            <option value="rejected">Rejetés</option>
          </select>

          <select
            value={filters.reason}
            onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
            className="px-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les motifs</option>
            {Object.entries(reasonLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={reports}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            loading={loading}
          />
        </motion.div>

        {/* Modal for Report Details */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1e293b] border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  Détails du Signalement
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Signalé par</p>
                  <p className="text-white">{selectedReport.reportedBy?.name} ({selectedReport.reportedBy?.email})</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Motif</p>
                  <p className="text-white">{reasonLabels[selectedReport.reason] || selectedReport.reason}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Description</p>
                  <p className="text-white">{selectedReport.description}</p>
                </div>

                {selectedReport.proofs.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Preuves</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.proofs.map((proof, index) => (
                        <img
                          key={index}
                          src={proof}
                          alt={`Preuve ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleClose(selectedReport._id)}
                      className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors font-medium"
                    >
                      Fermer sans action
                    </button>
                    {(selectedReport.announcement || selectedReport.trip) && (
                      <button
                        onClick={() => handleDeletePost(selectedReport._id)}
                        className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors font-medium"
                      >
                        Supprimer publication
                      </button>
                    )}
                    {selectedReport.reportedUser && (
                      <button
                        onClick={() => handleBanUser(selectedReport)}
                        className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors font-medium"
                      >
                        Bannir utilisateur
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
