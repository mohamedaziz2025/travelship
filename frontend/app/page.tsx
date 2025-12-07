'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '@/components/navbar'
import { SearchBar } from '@/components/search-bar'
import { ArrowRight, Package, Shield, Zap, Users, Star, CheckCircle, MapPin, Calendar, DollarSign, Eye, Heart, X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { announcementsApi, tripsApi, matchingApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

interface Announcement {
  _id: string
  type: 'package' | 'shopping'
  from: { city: string; country: string }
  to: { city: string; country: string }
  dateFrom: string
  dateTo: string
  reward: number
  weight?: number
  description: string
  status: string
  views: number
  userId: {
    name: string
    avatarUrl?: string
    verified: boolean
  }
}

interface Trip {
  _id: string
  from: { city: string; country: string }
  to: { city: string; country: string }
  departureDate: string
  arrivalDate: string
  availableKg: number
  pricePerKg: number
  status: string
  views: number
  userId: {
    name: string
    avatarUrl?: string
    verified: boolean
  }
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const [searchType, setSearchType] = useState<'announcements' | 'trips'>('announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Announcement | Trip | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)

  useEffect(() => {
    // Check if there are search params
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const type = searchParams.get('type') as 'announcements' | 'trips'
    
    if (from || to) {
      setHasSearched(true)
      if (type) setSearchType(type)
      loadResults()
    }
  }, [searchParams])

  const loadResults = async () => {
    setLoading(true)
    try {
      const params: any = {}
      const from = searchParams.get('from')
      const to = searchParams.get('to')
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')

      if (from) params.from = from
      if (to) params.to = to
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo

      if (searchType === 'announcements') {
        const response = await announcementsApi.getAll(params)
        if (response.data.success) {
          setAnnouncements(response.data.data.announcements)
        }
      } else {
        const response = await tripsApi.getAll(params)
        if (response.data.success) {
          setTrips(response.data.data.trips)
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async (item: Announcement | Trip, type: 'announcement' | 'trip') => {
    setLoadingMatches(true)
    setSelectedItem(item)
    setShowMatchModal(true)
    
    try {
      const response = type === 'announcement'
        ? await matchingApi.getMatchesForAnnouncement(item._id)
        : await matchingApi.getMatchesForTrip(item._id)
      
      if (response.data.success) {
        setMatches(response.data.data.matches)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des matchs')
    } finally {
      setLoadingMatches(false)
    }
  }

  const closeMatchModal = () => {
    setShowMatchModal(false)
    setSelectedItem(null)
    setMatches([])
  }

  return (
    <div className="min-h-screen bg-light">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
            <h1 className="text-6xl lg:text-7xl font-bold">
              Connectez{' '}
              <span className="text-gradient">voyageurs</span>
              {' '}et{' '}
              <span className="text-gradient">expéditeurs</span>
            </h1>
            
            <p className="text-xl text-dark-lighter max-w-2xl mx-auto">
              La plateforme premium qui met en relation les voyageurs disponibles 
              avec ceux qui ont besoin d'envoyer des colis. Simple, sécurisé, économique.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/how-it-works" className="btn-secondary text-lg px-8 py-4">
                Comment ça marche
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-16 flex justify-center animate-fade-up animation-delay-200">
            <SearchBar variant="hero" onSearch={loadResults} />
          </div>

          {/* Search Type Toggle */}
          {hasSearched && (
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-lg bg-white p-1 shadow-sm">
                <button
                  onClick={() => { setSearchType('announcements'); loadResults(); }}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    searchType === 'announcements'
                      ? 'bg-gradient-primary text-white'
                      : 'text-dark/60 hover:text-dark'
                  }`}
                >
                  Annonces ({announcements.length})
                </button>
                <button
                  onClick={() => { setSearchType('trips'); loadResults(); }}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    searchType === 'trips'
                      ? 'bg-gradient-primary text-white'
                      : 'text-dark/60 hover:text-dark'
                  }`}
                >
                  Trajets ({trips.length})
                </button>
              </div>
            </div>
          )}

          {/* Trust indicators */}
          {!hasSearched && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-dark-lighter animate-fade-up animation-delay-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Profils vérifiés</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span>4.9/5 sur 10,000+ avis</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Results Section */}
      {hasSearched && (
        <section className="py-12 bg-white">
          <div className="container max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-lg text-dark/60">Recherche en cours...</p>
              </div>
            ) : (
              <>
                {/* Announcements Results */}
                {searchType === 'announcements' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-6">
                      {announcements.length} annonce{announcements.length !== 1 ? 's' : ''} trouvée{announcements.length !== 1 ? 's' : ''}
                    </h2>
                    
                    {announcements.length === 0 ? (
                      <div className="text-center py-12 card">
                        <Package className="w-16 h-16 mx-auto text-dark/20 mb-4" />
                        <p className="text-lg text-dark/60">Aucune annonce trouvée</p>
                        <p className="text-sm text-dark/40 mt-2">Essayez de modifier vos critères de recherche</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {announcements.map((announcement) => (
                          <Link
                            key={announcement._id}
                            href={`/announcements/${announcement._id}`}
                            className="card hover:shadow-xl transition-all group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                                    {announcement.userId.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">{announcement.userId.name}</span>
                                      {announcement.userId.verified && (
                                        <CheckCircle className="w-4 h-4 text-accent" />
                                      )}
                                    </div>
                                    <span className="text-xs text-dark/60">
                                      {announcement.type === 'package' ? '📦 Colis' : '🛍️ Shopping'}
                                    </span>
                                  </div>
                                </div>

                                {/* Route */}
                                <div className="flex items-center gap-2 mb-3">
                                  <MapPin className="w-5 h-5 text-primary" />
                                  <span className="font-medium">{announcement.from.city}, {announcement.from.country}</span>
                                  <ArrowRight className="w-4 h-4 text-dark/40" />
                                  <MapPin className="w-5 h-5 text-secondary" />
                                  <span className="font-medium">{announcement.to.city}, {announcement.to.country}</span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-dark/70 mb-3 line-clamp-2">
                                  {announcement.description}
                                </p>

                                {/* Details */}
                                <div className="flex items-center gap-4 text-sm text-dark/60">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(announcement.dateFrom).toLocaleDateString('fr-FR')}
                                  </span>
                                  {announcement.weight && (
                                    <span className="flex items-center gap-1">
                                      <Package className="w-4 h-4" />
                                      {announcement.weight} kg
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {announcement.views} vues
                                  </span>
                                </div>
                              </div>

                              {/* Reward */}
                              <div className="text-right space-y-2">
                                <div className="text-2xl font-bold text-accent mb-1">
                                  {announcement.reward}€
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    loadMatches(announcement, 'announcement')
                                  }}
                                  className="btn-primary !px-4 !py-2 text-sm w-full"
                                >
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  Matcher
                                </button>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Trips Results */}
                {searchType === 'trips' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-6">
                      {trips.length} trajet{trips.length !== 1 ? 's' : ''} trouvé{trips.length !== 1 ? 's' : ''}
                    </h2>
                    
                    {trips.length === 0 ? (
                      <div className="text-center py-12 card">
                        <Users className="w-16 h-16 mx-auto text-dark/20 mb-4" />
                        <p className="text-lg text-dark/60">Aucun trajet trouvé</p>
                        <p className="text-sm text-dark/40 mt-2">Essayez de modifier vos critères de recherche</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {trips.map((trip) => (
                          <Link
                            key={trip._id}
                            href={`/trips/${trip._id}`}
                            className="card hover:shadow-xl transition-all group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                                    {trip.userId.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">{trip.userId.name}</span>
                                      {trip.userId.verified && (
                                        <CheckCircle className="w-4 h-4 text-accent" />
                                      )}
                                    </div>
                                    <span className="text-xs text-dark/60">✈️ Voyageur</span>
                                  </div>
                                </div>

                                {/* Route */}
                                <div className="flex items-center gap-2 mb-3">
                                  <MapPin className="w-5 h-5 text-primary" />
                                  <span className="font-medium">{trip.from.city}, {trip.from.country}</span>
                                  <ArrowRight className="w-4 h-4 text-dark/40" />
                                  <MapPin className="w-5 h-5 text-secondary" />
                                  <span className="font-medium">{trip.to.city}, {trip.to.country}</span>
                                </div>

                                {/* Details */}
                                <div className="flex items-center gap-4 text-sm text-dark/60">
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

                              {/* Price */}
                              <div className="text-right space-y-2">
                                <div className="text-2xl font-bold text-accent mb-1">
                                  {trip.pricePerKg}€<span className="text-sm text-dark/60">/kg</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    loadMatches(trip, 'trip')
                                  }}
                                  className="btn-primary !px-4 !py-2 text-sm w-full"
                                >
                                  <Sparkles className="w-4 h-4 mr-1" />
                                  Matcher
                                </button>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-xl text-dark-lighter max-w-2xl mx-auto">
              Un processus simple en 3 étapes pour connecter voyageurs et expéditeurs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Publiez</h3>
              <p className="text-dark-lighter">
                Créez une annonce pour un colis à envoyer ou un trajet que vous effectuez
              </p>
            </div>

            {/* Step 2 */}
            <div className="card text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Matchons</h3>
              <p className="text-dark-lighter">
                Notre algorithme trouve les meilleures correspondances selon vos critères
              </p>
            </div>

            {/* Step 3 */}
            <div className="card text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Connectez</h3>
              <p className="text-dark-lighter">
                Échangez via notre chat sécurisé et finalisez les détails
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-light">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pourquoi TravelShip ?</h2>
            <p className="text-xl text-dark-lighter max-w-2xl mx-auto">
              La solution complète pour l'envoi et le transport de colis entre particuliers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="card-glass">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Sécurité maximale</h3>
                  <p className="text-dark-lighter">
                    Profils vérifiés, paiements sécurisés, système de notation et assurance incluse
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glass">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Matching intelligent</h3>
                  <p className="text-dark-lighter">
                    Algorithme avancé pour trouver les meilleures correspondances automatiquement
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glass">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Communauté active</h3>
                  <p className="text-dark-lighter">
                    Rejoignez des milliers d'utilisateurs qui s'entraident chaque jour
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glass">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Économique</h3>
                  <p className="text-dark-lighter">
                    Réduisez vos coûts d'envoi jusqu'à 70% par rapport aux transporteurs classiques
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et publiez votre première annonce en moins de 2 minutes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="btn bg-white text-primary hover:bg-light-dark hover:text-primary text-lg px-8 py-4"
            >
              Créer mon compte
            </Link>
            <Link 
              href="/search" 
              className="btn bg-white/10 text-white hover:bg-white/20 border-2 border-white text-lg px-8 py-4"
            >
              Explorer les annonces
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-xl font-bold text-white">TravelShip</span>
              </div>
              <p className="text-light-darker text-sm">
                La plateforme qui connecte voyageurs et expéditeurs
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-light-darker text-sm">
                <li><Link href="/how-it-works" className="hover:text-white">Comment ça marche</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Tarifs</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-light-darker text-sm">
                <li><Link href="/about" className="hover:text-white">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Carrières</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-light-darker text-sm">
                <li><Link href="/terms" className="hover:text-white">Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Confidentialité</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-light-darker pt-8 text-center text-light-darker text-sm">
            <p>© 2025 TravelShip. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-primary p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Matchs compatibles
                  </h2>
                  <p className="text-white/80 mt-1">
                    {matches.length} {searchType === 'announcements' ? 'trajet' : 'annonce'}{matches.length !== 1 ? 's' : ''} compatible{matches.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={closeMatchModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingMatches ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-dark/60">Recherche des meilleurs matchs...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-dark/20 mb-4" />
                  <p className="text-lg text-dark/60">Aucun match trouvé</p>
                  <p className="text-sm text-dark/40 mt-2">Essayez avec d'autres critères</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match, index) => {
                    const item = match.trip || match.announcement
                    const score = match.score
                    
                    return (
                      <div key={index} className="card border-2 border-transparent hover:border-primary transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Score Badge */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                score >= 80 ? 'bg-green-100 text-green-700' :
                                score >= 60 ? 'bg-blue-100 text-blue-700' :
                                score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {score}% Match
                              </div>
                              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                                {item.userId?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{item.userId?.name}</span>
                                  {item.userId?.verified && (
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                  )}
                                </div>
                                <span className="text-xs text-dark/60">
                                  {match.trip ? '✈️ Voyageur' : match.announcement?.type === 'package' ? '📦 Colis' : '🛍️ Shopping'}
                                </span>
                              </div>
                            </div>

                            {/* Route */}
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="w-5 h-5 text-primary" />
                              <span className="font-medium">{item.from.city}, {item.from.country}</span>
                              <ArrowRight className="w-4 h-4 text-dark/40" />
                              <MapPin className="w-5 h-5 text-secondary" />
                              <span className="font-medium">{item.to.city}, {item.to.country}</span>
                            </div>

                            {/* Details */}
                            <div className="flex items-center gap-4 text-sm text-dark/60">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {match.trip 
                                  ? new Date(item.departureDate).toLocaleDateString('fr-FR')
                                  : new Date(item.dateFrom).toLocaleDateString('fr-FR')
                                }
                              </span>
                              {match.trip && (
                                <span className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  {item.availableKg} kg disponibles
                                </span>
                              )}
                              {match.announcement && item.weight && (
                                <span className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  {item.weight} kg
                                </span>
                              )}
                            </div>

                            {/* Match Score Details */}
                            <div className="mt-3 pt-3 border-t border-light-darker">
                              <div className="flex flex-wrap gap-2">
                                {score >= 40 && (
                                  <>
                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                                      ✓ Même itinéraire
                                    </span>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                      ✓ Dates compatibles
                                    </span>
                                  </>
                                )}
                                {item.userId?.verified && (
                                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                                    ✓ Profil vérifié
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="text-right space-y-2">
                            {match.trip && (
                              <div className="text-xl font-bold text-accent">
                                {item.pricePerKg}€<span className="text-sm">/kg</span>
                              </div>
                            )}
                            {match.announcement && (
                              <div className="text-xl font-bold text-accent">
                                {item.reward}€
                              </div>
                            )}
                            <Link
                              href={match.trip ? `/trips/${item._id}` : `/announcements/${item._id}`}
                              className="btn-primary !px-4 !py-2 text-sm block text-center"
                              onClick={closeMatchModal}
                            >
                              Voir détails
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
