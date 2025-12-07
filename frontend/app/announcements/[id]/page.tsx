'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavBar } from '@/components/navbar'
import { ArrowRight, Package, MapPin, Calendar, DollarSign, Eye, Edit, MessageCircle, Star, CheckCircle, Weight, Ruler, Shield } from 'lucide-react'
import { announcementsApi, matchingApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Announcement {
  _id: string
  type: 'package' | 'shopping'
  from: { city: string; country: string; coordinates: { lat: number; lng: number } }
  to: { city: string; country: string; coordinates: { lat: number; lng: number } }
  dateFrom: string
  dateTo: string
  reward: number
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  description: string
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
  trip: any
  score: number
}

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)

  useEffect(() => {
    loadAnnouncement()
    loadMatches()
  }, [params.id])

  const loadAnnouncement = async () => {
    try {
      const response = await announcementsApi.getById(params.id as string)
      if (response.data.success) {
        setAnnouncement(response.data.data.announcement)
      }
    } catch (error) {
      toast.error('Annonce introuvable')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async () => {
    setLoadingMatches(true)
    try {
      const response = await matchingApi.getMatchesForAnnouncement(params.id as string)
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
    router.push(`/chat?userId=${announcement?.userId._id}`)
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

  if (!announcement) {
    return null
  }

  const isOwner = user?.id === announcement.userId._id

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
                      {announcement.type === 'package' ? '📦 Colis' : '🛍️ Shopping'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      announcement.status === 'active' ? 'bg-green-100 text-green-700' :
                      announcement.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {announcement.status === 'active' ? 'Active' : 
                       announcement.status === 'matched' ? 'Matchée' : 'Complétée'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">
                    Envoi de {announcement.from.city} vers {announcement.to.city}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-dark/60">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {announcement.views} vues
                    </span>
                    <span>
                      Publié le {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-accent">
                    {announcement.reward}€
                  </div>
                  <p className="text-sm text-dark/60">Récompense</p>
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
                      <p className="font-semibold">{announcement.from.city}</p>
                      <p className="text-sm text-dark/60">{announcement.from.country}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-dark/40" />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold">{announcement.to.city}</p>
                      <p className="text-sm text-dark/60">{announcement.to.country}</p>
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
                    <p className="font-medium">{new Date(announcement.dateFrom).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-sm text-dark/60">Date limite</p>
                    <p className="font-medium">{new Date(announcement.dateTo).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {announcement.weight && (
                  <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                    <Weight className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-dark/60">Poids</p>
                      <p className="font-medium">{announcement.weight} kg</p>
                    </div>
                  </div>
                )}
                {announcement.dimensions && (
                  <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                    <Ruler className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-dark/60">Dimensions</p>
                      <p className="font-medium">
                        {announcement.dimensions.length} × {announcement.dimensions.width} × {announcement.dimensions.height} cm
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-dark/70 whitespace-pre-line">{announcement.description}</p>
              </div>
            </div>

            {/* Matches Section */}
            {matches.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Trajets compatibles ({matches.length})</h2>
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <Link
                      key={index}
                      href={`/trips/${match.trip._id}`}
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
                          {match.trip.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{match.trip.userId?.name}</span>
                            {match.trip.userId?.verified && (
                              <CheckCircle className="w-4 h-4 text-accent" />
                            )}
                          </div>
                          <p className="text-sm text-dark/60">
                            {new Date(match.trip.departureDate).toLocaleDateString('fr-FR')} • {match.trip.availableKg} kg disponibles
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{match.trip.pricePerKg}€/kg</p>
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
              <h3 className="font-semibold mb-4">Publié par</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                  {announcement.userId.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{announcement.userId.name}</h4>
                    {announcement.userId.verified && (
                      <CheckCircle className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  {announcement.userId.stats && (
                    <div className="flex items-center gap-1 text-sm text-dark/60">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span>{announcement.userId.stats.rating.toFixed(1)}</span>
                      <span>• {announcement.userId.stats.completedTrips} trajets</span>
                    </div>
                  )}
                </div>
              </div>

              {announcement.userId.badges && announcement.userId.badges.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-dark/60 mb-2">Badges</p>
                  <div className="flex flex-wrap gap-2">
                    {announcement.userId.badges.map((badge, index) => (
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
                      href={`/announcements/${announcement._id}/edit`}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Modifier l'annonce
                    </Link>
                    <p className="text-xs text-center text-dark/60">C'est votre annonce</p>
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
                        Utilisez toujours la messagerie TravelShip pour communiquer en toute sécurité
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
                  <span>Ne partagez jamais d'informations personnelles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>Rencontrez-vous dans des lieux publics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
