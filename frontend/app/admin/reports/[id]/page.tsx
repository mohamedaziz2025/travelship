'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Flag,
  User,
  AlertTriangle,
  CheckCircle,
  Ban,
  Trash2,
  Image as ImageIcon,
  Calendar,
  FileText,
  Archive,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface ReportDetails {
  _id: string
  type: string
  reason: string
  description?: string
  status: string
  actionTaken?: string
  reportedBy: {
    _id: string
    name: string
    email: string
  }
  reportedUser?: {
    _id: string
    name: string
    email: string
  }
  reportedContent?: {
    _id: string
    title?: string
    type?: string
  }
  proofs?: string[]
  createdAt: string
  reviewedAt?: string
  reviewedBy?: {
    _id: string
    name: string
  }
}

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  fraud: 'Fraude',
  scam: 'Arnaque',
  harassment: 'Harcèlement',
  inappropriate_content: 'Contenu inapproprié',
  fake_profile: 'Faux profil',
  violence: 'Violence',
  hate_speech: 'Discours haineux',
  other: 'Autre',
}

export default function ReportDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [report, setReport] = useState<ReportDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    loadReport()
  }, [isAuthenticated, currentUser, router])

  const loadReport = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getReportById(params.id as string)
      setReport(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
      router.push('/admin/reports')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    if (!report) return
    if (!confirm(`Confirmer l'action: ${action}?`)) return

    try {
      await adminApi.handleReport(report._id, action)
      toast.success('Action effectuée')
      loadReport()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleArchive = async () => {
    if (!report) return
    if (!confirm('Archiver ce signalement ?')) return

    try {
      await adminApi.archiveReport(report._id)
      toast.success('Signalement archivé')
      router.push('/admin/reports')
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

  if (!report) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <AdminSidebar />

      <main className="flex-1 ml-[280px] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/reports')}
              className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg hover:bg-[#2d3748] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Flag className="w-8 h-8 text-red-400" />
                Détails du Signalement
              </h1>
              <p className="text-gray-400 mt-1">ID: {report._id}</p>
            </div>
          </div>

          {report.status === 'pending' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAction('close')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Classer
              </button>
              <button
                onClick={() => handleAction('deletePost')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer le contenu
              </button>
              <button
                onClick={() => handleAction('banUser')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Bannir l'utilisateur
              </button>
              <button
                onClick={handleArchive}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archiver
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Informations du Signalement</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Type</p>
                  <p className="text-white font-medium capitalize">{report.type}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Raison</p>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                    {reasonLabels[report.reason] || report.reason}
                  </span>
                </div>

                {report.description && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Description</p>
                    <p className="text-white bg-[#0f172a] p-4 rounded-lg">{report.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-400 text-sm mb-1">Date du signalement</p>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4" />
                    {new Date(report.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Proofs */}
            {report.proofs && report.proofs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Preuves ({report.proofs.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {report.proofs.map((proof, index) => (
                    <a
                      key={index}
                      href={proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-video bg-[#0f172a] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                      <img
                        src={proof}
                        alt={`Preuve ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reported Content */}
            {report.reportedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contenu Signalé
                </h3>
                <div className="space-y-2">
                  {report.reportedContent.title && (
                    <p className="text-white">
                      <span className="text-gray-400">Titre:</span> {report.reportedContent.title}
                    </p>
                  )}
                  {report.reportedContent.type && (
                    <p className="text-white">
                      <span className="text-gray-400">Type:</span> {report.reportedContent.type}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      if (report.type === 'announcement') {
                        router.push(`/admin/announcements/${report.reportedContent?._id}`)
                      }
                    }}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                  >
                    Voir le contenu
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Signalé par</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{report.reportedBy.name}</p>
                  <p className="text-gray-400 text-sm">{report.reportedBy.email}</p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/admin/users/${report.reportedBy._id}`)}
                className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
              >
                Voir le profil
              </button>
            </motion.div>

            {/* Reported User */}
            {report.reportedUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Utilisateur signalé</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{report.reportedUser.name}</p>
                    <p className="text-gray-400 text-sm">{report.reportedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/admin/users/${report.reportedUser?._id}`)}
                  className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Voir le profil
                </button>
              </motion.div>
            )}

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Statut</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm mb-1">État</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === 'pending' 
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {report.status === 'pending' ? 'En attente' : 'Traité'}
                  </span>
                </div>

                {report.actionTaken && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Action prise</p>
                    <p className="text-white font-medium">{report.actionTaken}</p>
                  </div>
                )}

                {report.reviewedBy && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Traité par</p>
                    <p className="text-white font-medium">{report.reviewedBy.name}</p>
                  </div>
                )}

                {report.reviewedAt && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Traité le</p>
                    <p className="text-white text-sm">
                      {new Date(report.reviewedAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
