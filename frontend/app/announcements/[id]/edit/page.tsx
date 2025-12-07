'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavBar } from '@/components/navbar'
import { Save, ArrowLeft } from 'lucide-react'
import { announcementsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function EditAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'package' as 'package' | 'shopping',
    fromCity: '',
    fromCountry: '',
    toCity: '',
    toCountry: '',
    pickupDate: '',
    deliveryDate: '',
    reward: '',
    weight: '',
    description: '',
    length: '',
    width: '',
    height: '',
  })

  useEffect(() => {
    if (!user) {
      toast.error('Vous devez être connecté')
      router.push('/login')
      return
    }
    loadAnnouncement()
  }, [user, params.id])

  const loadAnnouncement = async () => {
    try {
      const response = await announcementsApi.getById(params.id as string)
      if (response.data.success) {
        const announcement = response.data.data.announcement
        
        // Check if user is the owner
        if (announcement.userId._id !== user?.id) {
          toast.error('Vous n\'êtes pas autorisé à modifier cette annonce')
          router.push(`/announcements/${params.id}`)
          return
        }

        setFormData({
          type: announcement.type,
          fromCity: announcement.from.city,
          fromCountry: announcement.from.country,
          toCity: announcement.to.city,
          toCountry: announcement.to.country,
          pickupDate: announcement.dateFrom.split('T')[0],
          deliveryDate: announcement.dateTo.split('T')[0],
          reward: announcement.reward.toString(),
          weight: announcement.weight?.toString() || '',
          description: announcement.description,
          length: announcement.dimensions?.length.toString() || '',
          width: announcement.dimensions?.width.toString() || '',
          height: announcement.dimensions?.height.toString() || '',
        })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
      router.push('/announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: any = {
        type: formData.type,
        from: {
          city: formData.fromCity,
          country: formData.fromCountry,
          coordinates: { lat: 0, lng: 0 },
        },
        to: {
          city: formData.toCity,
          country: formData.toCountry,
          coordinates: { lat: 0, lng: 0 },
        },
        dateFrom: new Date(formData.pickupDate),
        dateTo: new Date(formData.deliveryDate),
        reward: Number(formData.reward),
        description: formData.description,
      }

      if (formData.weight) {
        payload.weight = Number(formData.weight)
      }

      if (formData.length && formData.width && formData.height) {
        payload.dimensions = {
          length: Number(formData.length),
          width: Number(formData.width),
          height: Number(formData.height),
        }
      }

      await announcementsApi.update(params.id as string, payload)
      toast.success('Annonce modifiée avec succès !')
      router.push(`/announcements/${params.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light">
        <NavBar />
        <div className="container max-w-3xl mx-auto px-4 py-24 text-center">
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light">
      <NavBar />
      
      <div className="container max-w-3xl mx-auto px-4 py-24">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/announcements/${params.id}`}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-bold">Modifier l'annonce</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Type d'annonce</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'package' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'package'
                    ? 'border-primary bg-primary/5'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">📦</div>
                <div className="font-medium">Colis</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'shopping' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'shopping'
                    ? 'border-primary bg-primary/5'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">🛍️</div>
                <div className="font-medium">Shopping</div>
              </button>
            </div>
          </div>

          {/* From */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ville de départ *</label>
              <input
                type="text"
                required
                value={formData.fromCity}
                onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                className="input-field"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pays de départ *</label>
              <input
                type="text"
                required
                value={formData.fromCountry}
                onChange={(e) => setFormData({ ...formData, fromCountry: e.target.value })}
                className="input-field"
                placeholder="France"
              />
            </div>
          </div>

          {/* To */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ville d'arrivée *</label>
              <input
                type="text"
                required
                value={formData.toCity}
                onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                className="input-field"
                placeholder="Lyon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pays d'arrivée *</label>
              <input
                type="text"
                required
                value={formData.toCountry}
                onChange={(e) => setFormData({ ...formData, toCountry: e.target.value })}
                className="input-field"
                placeholder="France"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date de récupération *</label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date limite de livraison *</label>
              <input
                type="date"
                required
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Reward and Weight */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Récompense (€) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                className="input-field"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Poids (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input-field"
                placeholder="5"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium mb-2">Dimensions (cm) - Optionnel</label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                min="0"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className="input-field"
                placeholder="Longueur"
              />
              <input
                type="number"
                min="0"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                className="input-field"
                placeholder="Largeur"
              />
              <input
                type="number"
                min="0"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="input-field"
                placeholder="Hauteur"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              placeholder="Décrivez votre colis ou ce que vous souhaitez faire acheter..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href={`/announcements/${params.id}`}
              className="btn-secondary flex-1 text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
