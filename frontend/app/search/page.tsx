'use client'

import { NavBar } from '@/components/navbar'
import { Filter, Grid, List, MapIcon, Search, MapPin, Calendar, Package, DollarSign, Eye, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { announcementsApi, tripsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
    verified?: boolean
    stats?: { rating: number }
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
    verified?: boolean
    stats?: { rating: number }
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid')
  const [searchType, setSearchType] = useState<'shipper' | 'sender'>('shipper')
  const [showFilters, setShowFilters] = useState(true)
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtres
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    dateFrom: '',
    dateTo: '',
    minReward: '',
    maxReward: '',
    type: '',
    minKg: '',
    userType: '',
    transportType: '',
    weightRange: '',
    serviceType: '',
    packageType: '',
    isUrgent: '',
    sortBy: 'recent'
  })

  // Initialize filters from URL params
  useEffect(() => {
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const type = searchParams.get('type') || ''
    
    setFilters(prev => ({
      ...prev,
      from,
      to,
      dateFrom,
      dateTo,
      type
    }))
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [searchType, filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      if (filters.dateFrom) params.dateFrom = filters.dateFrom
      if (filters.dateTo) params.dateTo = filters.dateTo
      if (filters.minReward) params.minReward = filters.minReward
      if (filters.maxReward) params.maxReward = filters.maxReward
      if (filters.type) params.type = filters.type
      
      // Filtre selon le type d'annonce sélectionné
      params.userType = searchType
      
      if (filters.transportType) params.transportType = filters.transportType
      if (filters.weightRange) params.weightRange = filters.weightRange
      if (filters.serviceType) params.serviceType = filters.serviceType
      if (filters.packageType) params.packageType = filters.packageType
      if (filters.isUrgent) params.isUrgent = filters.isUrgent
      if (filters.sortBy) params.sortBy = filters.sortBy
      
      const response = await announcementsApi.getAll(params)
      if (response.data.success) {
        setAnnouncements(response.data.data.announcements)
      }
    } catch (error) {
      toast.error('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      from: '',
      to: '',
      dateFrom: '',
      dateTo: '',
      minReward: '',
      maxReward: '',
      type: '',
      minKg: '',
      userType: '',
      transportType: '',
      weightRange: '',
      serviceType: '',
      packageType: '',
      isUrgent: '',
      sortBy: 'recent'
    })
  }

  return (
    <div className="min-h-screen bg-light">
      <NavBar />
      
      <div className="pt-24 pb-12">
        <div className="container-custom">
          {/* Header with Search */}
          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-dark">
                {searchType === 'shipper' ? 'Annonces Shipper' : 'Annonces Sender'}
              </h1>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-primary text-white' : 'text-dark-lighter'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded ${view === 'list' ? 'bg-primary text-white' : 'text-dark-lighter'}`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`p-2 rounded ${view === 'map' ? 'bg-primary text-white' : 'text-dark-lighter'}`}
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar Simple */}
            <div className="card">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-dark-lighter" />
                <input
                  type="text"
                  placeholder="Rechercher une ville..."
                  className="flex-1 bg-transparent border-none focus:outline-none"
                  onChange={(e) => {
                    const value = e.target.value
                    if (value) {
                      handleFilterChange('from', value)
                    }
                  }}
                />
              </div>
            </div>

            {/* Type Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchType('shipper')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  searchType === 'shipper'
                    ? 'bg-gradient-primary text-white shadow-premium'
                    : 'bg-white text-dark-lighter hover:text-primary'
                }`}
              >
                ✈️ Annonce Shipper
              </button>
              <button
                onClick={() => setSearchType('sender')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  searchType === 'sender'
                    ? 'bg-gradient-primary text-white shadow-premium'
                    : 'bg-white text-dark-lighter hover:text-primary'
                }`}
              >
                📦 Annonce Sender
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ml-auto flex items-center space-x-2 px-6 py-2 bg-white rounded-lg hover:bg-light-dark transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filtres</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="lg:col-span-1">
                <div className="card space-y-6 sticky top-24">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Filtres</h3>
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  {/* Moyen de transport (pour Shipper) */}
                  {searchType === 'shipper' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Moyen de transport</label>
                          <select 
                            value={filters.transportType}
                            onChange={(e) => handleFilterChange('transportType', e.target.value)}
                            className="input-field"
                          >
                            <option value="">Tous</option>
                            <option value="plane">✈️ Avion</option>
                            <option value="boat">🚢 Bateau</option>
                            <option value="train">🚂 Train</option>
                            <option value="car">🚗 Voiture</option>
                          </select>
                        </div>
                      )}

                  {/* Type de service (pour Shipper) */}
                  {searchType === 'shipper' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Type de service</label>
                      <select 
                        value={filters.serviceType}
                        onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Tous</option>
                        <option value="paid">💰 Rémunéré</option>
                        <option value="free">🆓 Gratuit</option>
                      </select>
                    </div>
                  )}

                  {/* Type de colis */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Type de colis</label>
                    <select 
                      value={filters.packageType}
                      onChange={(e) => handleFilterChange('packageType', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Tous</option>
                      <option value="personal">📦 Colis personnel</option>
                      <option value="purchase">🛍️ Achat</option>
                      <option value="both">📦🛍️ Les deux</option>
                    </select>
                  </div>

                  {/* Plage de poids */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Package className="w-4 h-4 inline mr-1" />
                      Poids
                    </label>
                    <select 
                      value={filters.weightRange}
                      onChange={(e) => handleFilterChange('weightRange', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Tous</option>
                      <option value="0-1">0–1 kg</option>
                      <option value="2-5">2–5 kg</option>
                      <option value="5-10">5–10 kg</option>
                      <option value="10-15">10–15 kg</option>
                      <option value="15-20">15–20 kg</option>
                      <option value="20-25">20–25 kg</option>
                      <option value="25-30">25–30 kg</option>
                      <option value="30+">+30 kg</option>
                    </select>
                  </div>

                  {/* Urgent (pour Sender) */}
                  {searchType === 'sender' && (
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={filters.isUrgent === 'true'}
                          onChange={(e) => handleFilterChange('isUrgent', e.target.checked ? 'true' : '')}
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium">🚨 Urgent uniquement</span>
                      </label>
                    </div>
                  )}
                  
                  {/* Ville de départ */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Ville de départ
                    </label>
                    <input 
                      type="text"
                      placeholder="Paris, Lyon..."
                      value={filters.from}
                      onChange={(e) => handleFilterChange('from', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Ville d'arrivée */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Ville d'arrivée
                    </label>
                    <input 
                      type="text"
                      placeholder="Marseille, Nice..."
                      value={filters.to}
                      onChange={(e) => handleFilterChange('to', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Date de départ */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date de début
                    </label>
                    <input 
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Date de fin */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date de fin
                    </label>
                    <input 
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Type d'annonce */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select 
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Tous</option>
                      <option value="package">📦 Colis</option>
                      <option value="shopping">🛍️ Achat</option>
                    </select>
                  </div>

                  {/* Récompense */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Récompense min
                    </label>
                    <input 
                      type="number"
                      placeholder="50"
                      value={filters.minReward}
                      onChange={(e) => handleFilterChange('minReward', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Récompense max</label>
                    <input 
                      type="number"
                      placeholder="500"
                      value={filters.maxReward}
                      onChange={(e) => handleFilterChange('maxReward', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </aside>
            )}

            {/* Results */}
            <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-dark-lighter">
                  <span className="font-semibold text-dark">
                    {announcements.length}
                  </span> résultats trouvés
                </p>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 bg-white rounded-lg border border-light-darker"
                >
                  <option value="recent">Plus récent</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option>Plus de vues</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-dark-lighter">Chargement...</p>
                </div>
              ) : (
                <>
                  {announcements.length === 0 ? (
                    <div className="card text-center py-12">
                      <Package className="w-16 h-16 text-dark-lighter mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Aucune annonce trouvée</h3>
                      <p className="text-dark-lighter mb-6">Modifiez vos critères de recherche</p>
                      <button onClick={clearFilters} className="btn-primary">
                        Réinitialiser les filtres
                      </button>
                      </div>
                    ) : (
                      <div className={view === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                        {announcements.map((announcement) => (
                          <Link 
                            key={announcement._id}
                            href={`/announcements/${announcement._id}`}
                            className="card hover:shadow-premium transition-all group"
                          >
                            {/* Badge Type */}
                            <div className="flex items-center justify-between mb-4">
                              <span className={`badge ${
                                announcement.type === 'package' 
                                  ? 'badge-info' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {announcement.type === 'package' ? '📦 Colis' : '🛍️ Achat'}
                              </span>
                              <span className="text-sm font-bold text-primary">
                                {announcement.reward}€
                              </span>
                            </div>

                            {/* Route */}
                            <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                              {announcement.from.city} → {announcement.to.city}
                            </h3>
                            <p className="text-sm text-dark-lighter mb-4 line-clamp-2">
                              {announcement.description}
                            </p>

                            {/* Details */}
                            <div className="flex items-center gap-4 text-sm text-dark-lighter mb-4">
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
                            </div>

                            {/* User Info */}
                            <div className="flex items-center justify-between pt-4 border-t border-light-darker">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm">
                                  {announcement.userId.name?.[0] || 'U'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-dark">
                                    {announcement.userId.name}
                                  </p>
                                  {announcement.userId.verified && (
                                    <span className="text-xs text-green-600">✓ Vérifié</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-dark-lighter">
                                <Eye className="w-4 h-4" />
                                {announcement.views}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )
                  }

                  {/* Vue carte */}
                  {view === 'map' && (
                    <div className="card h-[600px] flex items-center justify-center">
                      <div className="text-center">
                        <MapIcon className="w-16 h-16 text-dark-lighter mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Vue carte</h3>
                        <p className="text-dark-lighter mb-4">
                          La carte interactive sera disponible prochainement
                        </p>
                        <p className="text-sm text-dark-lighter">
                          {announcements.length} annonces à afficher
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
