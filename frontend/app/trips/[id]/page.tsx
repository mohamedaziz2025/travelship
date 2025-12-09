'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavBar } from '@/components/navbar'
import { ArrowRight, Package, MapPin, Calendar, DollarSign, Eye, Edit, MessageCircle, Star, CheckCircle, Plane, Shield } from 'lucide-react'
import { tripsApi, matchingApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Trip {
  _id: string
  from: { city: string; country: string; coordinates: { lat: number; lng: number } }
  to: { city: string; country: string; coordinates: { lat: number; lng: number } }
  departureDate: string
  arrivalDate: string
  availableKg: number
  pricePerKg: number
  description?: string
  status: string
  views: number
  userId: {
    _id: string
    name: string
    email: string
    avatarUrl?: string
    verified: boolean
    stats?: {
      rating: number
      completedTrips: number
    }
    badges?: string[]
  }
  createdAt: string
}

interface Match {
  announcement: any
  score: number
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)

  useEffect(() => {
    loadTrip()
    loadMatches()
  }, [params.id])

  const loadTrip = async () => {
    try {
      const response = await tripsApi.getById(params.id as string)
      if (response.data.success) {
        setTrip(response.data.data.trip)
      }
    } catch (error) {
      toast.error('Trajet introuvable')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async () => {
    setLoadingMatches(true)
    try {
      const response = await matchingApi.getMatchesForTrip(params.id as string)
      if (response.data.success) {
        setMatches(response.data.data.matches.slice(0, 5)) // Top 5 matches
      }
    } catch (error) {
      console.error('Erreur lors du chargement des matchs')
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleContact = () => {
    if (!user) {
      toast.error('Vous devez être connecté pour contacter')
      router.push('/login')
      return
    }
    // Redirect to chat with this user
    router.push(`/chat?userId=${trip?.userId._id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light">
        <NavBar />
        <div className="container max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return null
  }

  const isOwner = user?.id === trip.userId._id

  return (
    <div className="min-h-screen bg-light">
      <NavBar />
      
      <div className="container max-w-7xl mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      ✈️ Trajet
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trip.status === 'active' ? 'bg-green-100 text-green-700' :
                      trip.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status === 'active' ? 'Actif' : 
                       trip.status === 'matched' ? 'Matché' : 'Complété'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">
                    Voyage de {trip.from.city} vers {trip.to.city}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-dark/60">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {trip.views} vues
                    </span>
                    <span>
                      Publié le {new Date(trip.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-accent">
                    {trip.pricePerKg}€<span className="text-2xl">/kg</span>
                  </div>
                  <p className="text-sm text-dark/60">Prix par kg</p>
                </div>
              </div>

              {/* Route */}
              <div className="bg-light rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{trip.from.city}</p>
                      <p className="text-sm text-dark/60">{trip.from.country}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Plane className="w-6 h-6 text-dark/40 mb-1" />
                    <ArrowRight className="w-6 h-6 text-dark/40" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold">{trip.to.city}</p>
                      <p className="text-sm text-dark/60">{trip.to.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-dark/60">Date de départ</p>
                    <p className="font-medium">{new Date(trip.departureDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-sm text-dark/60">Date d'arrivée</p>
                    <p className="font-medium">{new Date(trip.arrivalDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                  <Package className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-dark/60">Capacité disponible</p>
                    <p className="font-medium">{trip.availableKg} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-dark/60">Prix total estimé</p>
                    <p className="font-medium">{trip.pricePerKg * trip.availableKg}€ (max)</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {trip.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-dark/70 whitespace-pre-line">{trip.description}</p>
                </div>
              )}
            </div>

            {/* Matches Section */}
            {matches.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Annonces compatibles ({matches.length})</h2>
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <Link
                      key={index}
                      href={`/announcements/${match.announcement._id}`}
                      className="flex items-center justify-between p-4 bg-light hover:bg-light-darker rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          match.score >= 80 ? 'bg-green-100 text-green-700' :
                          match.score >= 60 ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {match.score}%
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                          {match.announcement.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{match.announcement.userId?.name}</span>
                            {match.announcement.userId?.verified && (
                              <CheckCircle className="w-4 h-4 text-accent" />
                            )}
                          </div>
                          <p className="text-sm text-dark/60">
                            {new Date(match.announcement.dateFrom).toLocaleDateString('fr-FR')} • {match.announcement.weight || '?'} kg
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{match.announcement.reward}€</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Card */}
            <div className="card">
              <h3 className="font-semibold mb-4">Voyageur</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                  {trip.userId.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{trip.userId.name}</h4>
                    {trip.userId.verified && (
                      <CheckCircle className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  {trip.userId.stats && (
                    <div className="flex items-center gap-1 text-sm text-dark/60">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span>{trip.userId.stats.rating.toFixed(1)}</span>
                      <span>• {trip.userId.stats.completedTrips} trajets</span>
                    </div>
                  )}
                </div>
              </div>

              {trip.userId.badges && trip.userId.badges.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-dark/60 mb-2">Badges</p>
                  <div className="flex flex-wrap gap-2">
                    {trip.userId.badges.map((badge, index) => (
                      <span key={index} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {isOwner ? (
                  <>
                    <Link
                      href={`/trips/${trip._id}/edit`}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Modifier le trajet
                    </Link>
                    <p className="text-xs text-center text-dark/60">C'est votre trajet</p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleContact}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contacter
                    </button>
                    <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
                      <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-dark/70">
                        Utilisez toujours la messagerie ShipperTrip pour communiquer en toute sécurité
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="card bg-light border-2 border-accent/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Conseils de sécurité
              </h3>
              <ul className="space-y-2 text-sm text-dark/70">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Vérifiez toujours l'identité de la personne</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Utilisez le système de paiement sécurisé</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Ne transportez jamais d'objets illégaux</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Vérifiez le contenu avant l'acceptation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
