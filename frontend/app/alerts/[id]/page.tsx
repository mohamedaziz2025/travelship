'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { NavBar } from '@/components/navbar'
import { alertsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { 
  Bell, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign,
  User,
  Star,
  CheckCircle,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AlertMatchesPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuthStore()
  const [alert, setAlert] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [matchType, setMatchType] = useState<'trips' | 'announcements'>('trips')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/alerts')
      return
    }
    loadAlertMatches()
  }, [isAuthenticated, params.id])

  const loadAlertMatches = async () => {
    try {
      const response = await alertsApi.getMatches(params.id as string)
      if (response.data.success) {
        setAlert(response.data.data.alert)
        setMatches(response.data.data.matches)
        setMatchType(response.data.data.matchType)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
      router.push('/alerts')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-light">
        <NavBar />
        <div className="pt-24 text-center">
          <p className="text-dark/60">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light">
      <NavBar />

      <div className="pt-24 pb-12 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/alerts"
            className="inline-flex items-center gap-2 text-dark/60 hover:text-dark mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux alertes
          </Link>

          {/* Alert Summary */}
          {alert && (
            <div className="card mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                    alert.type === 'sender' 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {alert.type === 'sender' 
                      ? '🔍 Je cherche un voyageur' 
                      : '📦 Je cherche des colis'}
                  </span>
                  
                  <div className="flex items-center gap-2 text-lg font-medium text-dark">
                    <MapPin className="w-5 h-5 text-primary" />
                    {alert.fromCity || 'Toute ville'}
                    <span className="text-dark/40">→</span>
                    {alert.toCity || 'Toute ville'}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-dark/60">
                    {(alert.dateFrom || alert.dateTo) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {alert.dateFrom && new Date(alert.dateFrom).toLocaleDateString('fr-FR')}
                        {alert.dateFrom && alert.dateTo && ' - '}
                        {alert.dateTo && new Date(alert.dateTo).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <h2 className="text-2xl font-bold text-dark mb-6">
            {matches.length} {matchType === 'trips' ? 'trajet' : 'annonce'}{matches.length !== 1 ? 's' : ''} correspondant{matches.length !== 1 ? 's' : ''}
          </h2>

          {matches.length === 0 ? (
            <div className="card text-center py-12">
              <Package className="w-16 h-16 mx-auto text-dark/20 mb-4" />
              <h3 className="text-xl font-semibold text-dark mb-2">
                Aucune correspondance pour le moment
              </h3>
              <p className="text-dark/60">
                Nous vous notifierons dès qu'une nouvelle {matchType === 'trips' ? 'annonce de voyage' : 'annonce de colis'} correspondra à vos critères.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((item) => (
                <Link
                  key={item._id}
                  href={matchType === 'trips' ? `/trips/${item._id}` : `/announcements/${item._id}`}
                  className="card hover:shadow-xl transition-all group block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Route */}
                      <div className="flex items-center gap-2 text-dark font-medium mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {item.from?.city}, {item.from?.country}
                        <span className="text-dark/40">→</span>
                        {item.to?.city}, {item.to?.country}
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-2 text-sm text-dark/60 mb-2">
                        <Calendar className="w-4 h-4" />
                        {matchType === 'trips' ? (
                          <>
                            Départ: {new Date(item.departureDate).toLocaleDateString('fr-FR')}
                            {item.arrivalDate && (
                              <> - Arrivée: {new Date(item.arrivalDate).toLocaleDateString('fr-FR')}</>
                            )}
                          </>
                        ) : (
                          <>
                            Du {new Date(item.dateFrom).toLocaleDateString('fr-FR')}
                            {item.dateTo && (
                              <> au {new Date(item.dateTo).toLocaleDateString('fr-FR')}</>
                            )}
                          </>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 text-sm text-dark/70">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {matchType === 'trips' 
                            ? `${item.availableKg} kg disponible`
                            : item.weight ? `${item.weight} kg` : item.weightRange
                          }
                        </span>
                        <span className="flex items-center gap-1 text-accent font-medium">
                          <DollarSign className="w-4 h-4" />
                          {matchType === 'trips' 
                            ? `${item.pricePerKg}€/kg`
                            : `${item.reward}€`
                          }
                        </span>
                      </div>

                      {/* User */}
                      {item.userId && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-light-darker">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            {item.userId.avatarUrl ? (
                              <img 
                                src={item.userId.avatarUrl} 
                                alt="" 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-dark">
                            {item.userId.name}
                          </span>
                          {item.userId.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {item.userId.rating && (
                            <span className="flex items-center gap-1 text-sm text-dark/60">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              {item.userId.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Eye className="w-5 h-5 text-dark/40 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
