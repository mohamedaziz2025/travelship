'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plane, MapPin, Calendar, Package, Eye, Edit, Trash2, Plus } from 'lucide-react'
import { tripsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface Trip {
  _id: string
  from: { city: string; country: string }
  to: { city: string; country: string }
  departureDate: string
  arrivalDate: string
  availableKg: number
  status: string
  views: number
  createdAt: string
}

export default function MyTripsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await tripsApi.getMy()
      if (response.data.success) {
        setTrips(response.data.data.trips)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) return

    try {
      await tripsApi.delete(id)
      toast.success('Trajet supprimé')
      loadTrips()
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
            <h1 className="text-4xl font-bold text-dark mb-2">Mes trajets</h1>
            <p className="text-dark/60">
              Gérez vos voyages et offres de transport
            </p>
          </div>
          <Link href="/trips/new" className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Nouveau trajet
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Total</p>
            <p className="text-2xl font-bold">{trips.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Actifs</p>
            <p className="text-2xl font-bold text-green-600">
              {trips.filter((t) => t.status === 'active').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Matchés</p>
            <p className="text-2xl font-bold text-blue-600">
              {trips.filter((t) => t.status === 'matched').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-dark/60 mb-1">Complétés</p>
            <p className="text-2xl font-bold text-gray-600">
              {trips.filter((t) => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Trips List */}
        {trips.length === 0 ? (
          <div className="card text-center py-12">
            <Plane className="w-16 h-16 mx-auto text-dark/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun trajet</h3>
            <p className="text-dark/60 mb-6">
              Vous n'avez pas encore créé de trajet
            </p>
            <Link href="/trips/new" className="btn-primary inline-flex">
              <Plus className="w-5 h-5 mr-2" />
              Créer mon premier trajet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip._id} className="card hover:shadow-premium transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Status */}
                    <div className="flex items-center gap-2 mb-3">
                      <Plane className="w-5 h-5 text-primary" />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {trip.from.city}, {trip.from.country}
                        </span>
                      </div>
                      <span className="text-dark/40">→</span>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-secondary" />
                        <span className="font-medium">
                          {trip.to.city}, {trip.to.country}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-6 text-sm text-dark/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(trip.departureDate).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {trip.availableKg} kg disponibles
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {trip.views} vues
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/trips/${trip._id}`}
                      className="p-2 hover:bg-light-darker rounded-lg transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-5 h-5 text-dark/60" />
                    </Link>
                    <button
                      onClick={() => router.push(`/trips/${trip._id}/edit`)}
                      className="p-2 hover:bg-light-darker rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id)}
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
