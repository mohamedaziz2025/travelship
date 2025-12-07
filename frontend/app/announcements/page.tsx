'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, MapPin, Calendar, DollarSign, Eye, Edit, Trash2, Plus } from 'lucide-react'
import { announcementsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface Announcement {
  _id: string
  type: 'package' | 'shopping'
  from: { city: string; country: string }
  to: { city: string; country: string }
  dateFrom: string
  dateTo: string
  reward: number
  weight: number
  status: string
  views: number
  createdAt: string
}

export default function MyAnnouncementsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const response = await announcementsApi.getMy()
      if (response.data.success) {
        setAnnouncements(response.data.data.announcements)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return

    try {
      await announcementsApi.delete(id)
      toast.success('Annonce supprimée')
      loadAnnouncements()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      matched: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || styles.active
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light py-24 px-4">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark mb-2">Mes annonces</h1>
            <p className="text-dark/60">
              Gérez vos demandes de transport de colis
            </p>
          </div>
          <Link href="/announcements/new" className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle annonce
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Total</p>
            <p className="text-2xl font-bold">{announcements.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Actives</p>
            <p className="text-2xl font-bold text-green-600">
              {announcements.filter((a) => a.status === 'active').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Matchées</p>
            <p className="text-2xl font-bold text-blue-600">
              {announcements.filter((a) => a.status === 'matched').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Complétées</p>
            <p className="text-2xl font-bold text-gray-600">
              {announcements.filter((a) => a.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="card text-center py-12">
            <Package className="w-16 h-16 mx-auto text-dark/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune annonce</h3>
            <p className="text-dark/60 mb-6">
              Vous n'avez pas encore créé d'annonce
            </p>
            <Link href="/announcements/new" className="btn-primary inline-flex">
              <Plus className="w-5 h-5 mr-2" />
              Créer ma première annonce
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="card hover:shadow-premium transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Type & Status */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge-info">
                        {announcement.type === 'package' ? 'Colis' : 'Shopping'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(announcement.status)}`}>
                        {announcement.status}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {announcement.from.city}, {announcement.from.country}
                        </span>
                      </div>
                      <span className="text-dark/40">→</span>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-secondary" />
                        <span className="font-medium">
                          {announcement.to.city}, {announcement.to.country}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-6 text-sm text-dark/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.dateFrom).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {announcement.weight} kg
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {announcement.reward} €
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {announcement.views} vues
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/announcements/${announcement._id}`}
                      className="p-2 hover:bg-light-darker rounded-lg transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-5 h-5 text-dark/60" />
                    </Link>
                    <button
                      onClick={() => router.push(`/announcements/${announcement._id}/edit`)}
                      className="p-2 hover:bg-light-darker rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="p-2 hover:bg-light-darker rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
