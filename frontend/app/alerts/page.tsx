'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/navbar'
import { LocationAutocomplete } from '@/components/location-autocomplete'
import { ErrorMessage } from '@/components/form/error-message'
import { alertsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { 
  Bell, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign,
  Eye,
  X,
  AlertCircle,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Alert {
  _id: string
  type: 'sender' | 'shipper'
  fromCity?: string
  fromCountry?: string
  toCity?: string
  toCountry?: string
  dateFrom?: string
  dateTo?: string
  maxWeight?: number
  minWeight?: number
  maxReward?: number
  minReward?: number
  isActive: boolean
  matchCount: number
  createdAt: string
  lastNotifiedAt?: string
}

export default function AlertsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    type: 'sender' as 'sender' | 'shipper',
    fromCity: '',
    fromCountry: '',
    toCity: '',
    toCountry: '',
    dateFrom: '',
    dateTo: '',
    minWeight: '',
    maxWeight: '',
    minReward: '',
    maxReward: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/alerts')
      return
    }
    loadAlerts()
  }, [isAuthenticated])

  const loadAlerts = async () => {
    try {
      const response = await alertsApi.getAll()
      if (response.data.success) {
        setAlerts(response.data.data.alerts)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des alertes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const payload: any = {
        type: formData.type,
      }

      if (formData.fromCity) payload.fromCity = formData.fromCity
      if (formData.fromCountry) payload.fromCountry = formData.fromCountry
      if (formData.toCity) payload.toCity = formData.toCity
      if (formData.toCountry) payload.toCountry = formData.toCountry
      if (formData.dateFrom) payload.dateFrom = formData.dateFrom
      if (formData.dateTo) payload.dateTo = formData.dateTo
      if (formData.minWeight) payload.minWeight = Number(formData.minWeight)
      if (formData.maxWeight) payload.maxWeight = Number(formData.maxWeight)
      if (formData.minReward) payload.minReward = Number(formData.minReward)
      if (formData.maxReward) payload.maxReward = Number(formData.maxReward)

      const response = await alertsApi.create(payload)
      if (response.data.success) {
        toast.success('Alerte créée avec succès')
        setShowCreateModal(false)
        setFormData({
          type: 'sender',
          fromCity: '',
          fromCountry: '',
          toCity: '',
          toCountry: '',
          dateFrom: '',
          dateTo: '',
          minWeight: '',
          maxWeight: '',
          minReward: '',
          maxReward: '',
        })
        loadAlerts()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleAlert = async (id: string) => {
    try {
      const response = await alertsApi.toggle(id)
      if (response.data.success) {
        setAlerts(alerts.map(a => 
          a._id === id ? { ...a, isActive: !a.isActive } : a
        ))
        toast.success(response.data.message)
      }
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette alerte ?')) return

    try {
      const response = await alertsApi.delete(id)
      if (response.data.success) {
        setAlerts(alerts.filter(a => a._id !== id))
        toast.success('Alerte supprimée')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-light">
      <NavBar />

      <div className="pt-24 pb-12 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-dark mb-2">
                <Bell className="inline w-8 h-8 mr-2 text-primary" />
                Mes alertes
              </h1>
              <p className="text-dark/60">
                Recevez une notification quand une annonce correspond à vos critères
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
              disabled={alerts.length >= 5}
            >
              <Plus className="w-5 h-5" />
              Créer une alerte
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-dark mb-1">
                  Comment fonctionnent les alertes ?
                </p>
                <p className="text-sm text-dark/70">
                  Définissez vos critères (trajet, dates, poids, prix) et nous vous 
                  notifierons automatiquement quand une nouvelle annonce correspond. 
                  Vous pouvez avoir jusqu'à 5 alertes actives.
                </p>
              </div>
            </div>
          </div>

          {/* Alerts List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-dark/60">Chargement...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="card text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-dark/20 mb-4" />
              <h3 className="text-xl font-semibold text-dark mb-2">
                Aucune alerte
              </h3>
              <p className="text-dark/60 mb-6">
                Créez votre première alerte pour être notifié des nouvelles annonces
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer une alerte
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`card ${!alert.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Type Badge */}
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                        alert.type === 'sender' 
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {alert.type === 'sender' 
                          ? '🔍 Je cherche un voyageur' 
                          : '📦 Je cherche des colis à transporter'}
                      </span>

                      {/* Route */}
                      <div className="flex items-center gap-2 text-dark mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          {alert.fromCity || 'Toute ville'}{alert.fromCountry && `, ${alert.fromCountry}`}
                        </span>
                        <span className="text-dark/40">→</span>
                        <span className="font-medium">
                          {alert.toCity || 'Toute ville'}{alert.toCountry && `, ${alert.toCountry}`}
                        </span>
                      </div>

                      {/* Dates */}
                      {(alert.dateFrom || alert.dateTo) && (
                        <div className="flex items-center gap-2 text-sm text-dark/70 mb-2">
                          <Calendar className="w-4 h-4" />
                          {alert.dateFrom && (
                            <span>Du {new Date(alert.dateFrom).toLocaleDateString('fr-FR')}</span>
                          )}
                          {alert.dateTo && (
                            <span>au {new Date(alert.dateTo).toLocaleDateString('fr-FR')}</span>
                          )}
                        </div>
                      )}

                      {/* Weight & Price */}
                      <div className="flex items-center gap-4 text-sm text-dark/70">
                        {(alert.minWeight || alert.maxWeight) && (
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {alert.minWeight && `${alert.minWeight}kg`}
                            {alert.minWeight && alert.maxWeight && ' - '}
                            {alert.maxWeight && `${alert.maxWeight}kg`}
                          </div>
                        )}
                        {(alert.minReward || alert.maxReward) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {alert.minReward && `${alert.minReward}€`}
                            {alert.minReward && alert.maxReward && ' - '}
                            {alert.maxReward && `${alert.maxReward}€`}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-light-darker text-xs text-dark/50">
                        <span>
                          Créée le {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        {alert.matchCount > 0 && (
                          <span className="text-primary font-medium">
                            {alert.matchCount} correspondance{alert.matchCount > 1 ? 's' : ''} trouvée{alert.matchCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/alerts/${alert._id}`}
                        className="p-2 rounded-lg hover:bg-light-darker transition-colors"
                        title="Voir les correspondances"
                      >
                        <Eye className="w-5 h-5 text-dark/60" />
                      </Link>
                      <button
                        onClick={() => handleToggleAlert(alert._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          alert.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-dark/40 hover:bg-light-darker'
                        }`}
                        title={alert.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {alert.isActive ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-light-darker flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark">
                Créer une alerte
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-light-darker transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-dark mb-3">
                  Je recherche
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'sender' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === 'sender'
                        ? 'border-primary bg-primary/10'
                        : 'border-light-darker hover:border-primary/50'
                    }`}
                  >
                    <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Un voyageur</p>
                    <p className="text-xs text-dark/60 mt-1">
                      Pour transporter mon colis
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'shipper' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === 'shipper'
                        ? 'border-primary bg-primary/10'
                        : 'border-light-darker hover:border-primary/50'
                    }`}
                  >
                    <Bell className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Des colis à transporter</p>
                    <p className="text-xs text-dark/60 mt-1">
                      Je voyage et je cherche des annonces
                    </p>
                  </button>
                </div>
              </div>

              {/* From Location */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Ville de départ (optionnel)
                </label>
                <LocationAutocomplete
                  value={formData.fromCity && formData.fromCountry 
                    ? `${formData.fromCity}, ${formData.fromCountry}` 
                    : formData.fromCity}
                  onChange={(value) => {
                    if (value.includes(', ')) {
                      const parts = value.split(', ')
                      setFormData({
                        ...formData,
                        fromCity: parts[0] || '',
                        fromCountry: parts.slice(1).join(', ') || '',
                      })
                    } else {
                      setFormData({
                        ...formData,
                        fromCity: value,
                        fromCountry: '',
                      })
                    }
                  }}
                  placeholder="Toutes les villes"
                />
              </div>

              {/* To Location */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Ville d'arrivée (optionnel)
                </label>
                <LocationAutocomplete
                  value={formData.toCity && formData.toCountry 
                    ? `${formData.toCity}, ${formData.toCountry}` 
                    : formData.toCity}
                  onChange={(value) => {
                    if (value.includes(', ')) {
                      const parts = value.split(', ')
                      setFormData({
                        ...formData,
                        toCity: parts[0] || '',
                        toCountry: parts.slice(1).join(', ') || '',
                      })
                    } else {
                      setFormData({
                        ...formData,
                        toCity: value,
                        toCountry: '',
                      })
                    }
                  }}
                  placeholder="Toutes les villes"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    À partir du (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Jusqu'au (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.dateTo}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                    min={formData.dateFrom || new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    <Package className="inline w-4 h-4 mr-1" />
                    Poids min (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.minWeight}
                    onChange={(e) => setFormData({ ...formData, minWeight: e.target.value })}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    <Package className="inline w-4 h-4 mr-1" />
                    Poids max (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.maxWeight}
                    onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
                    className="input"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Reward */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Prix min (€)
                  </label>
                  <input
                    type="number"
                    value={formData.minReward}
                    onChange={(e) => setFormData({ ...formData, minReward: e.target.value })}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Prix max (€)
                  </label>
                  <input
                    type="number"
                    value={formData.maxReward}
                    onChange={(e) => setFormData({ ...formData, maxReward: e.target.value })}
                    className="input"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-light-darker">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {creating ? 'Création...' : 'Créer l\'alerte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
