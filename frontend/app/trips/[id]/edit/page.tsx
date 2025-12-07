'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavBar } from '@/components/navbar'
import { Save, ArrowLeft } from 'lucide-react'
import { tripsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function EditTripPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fromCity: '',
    fromCountry: '',
    toCity: '',
    toCountry: '',
    departureDate: '',
    arrivalDate: '',
    availableKg: '',
    pricePerKg: '',
    description: '',
  })

  useEffect(() => {
    if (!user) {
      toast.error('Vous devez être connecté')
      router.push('/login')
      return
    }
    loadTrip()
  }, [user, params.id])

  const loadTrip = async () => {
    try {
      const response = await tripsApi.getById(params.id as string)
      if (response.data.success) {
        const trip = response.data.data.trip
        
        // Check if user is the owner
        if (trip.userId._id !== user?.id) {
          toast.error('Vous n\'êtes pas autorisé à modifier ce trajet')
          router.push(`/trips/${params.id}`)
          return
        }

        setFormData({
          fromCity: trip.from.city,
          fromCountry: trip.from.country,
          toCity: trip.to.city,
          toCountry: trip.to.country,
          departureDate: trip.departureDate.split('T')[0],
          arrivalDate: trip.arrivalDate.split('T')[0],
          availableKg: trip.availableKg.toString(),
          pricePerKg: trip.pricePerKg.toString(),
          description: trip.description || '',
        })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
      router.push('/trips')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
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
        departureDate: new Date(formData.departureDate),
        arrivalDate: new Date(formData.arrivalDate),
        availableKg: Number(formData.availableKg),
        pricePerKg: Number(formData.pricePerKg),
        description: formData.description,
      }

      await tripsApi.update(params.id as string, payload)
      toast.success('Trajet modifié avec succès !')
      router.push(`/trips/${params.id}`)
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
            href={`/trips/${params.id}`}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-bold">Modifier le trajet</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
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
              <label className="block text-sm font-medium mb-2">Date de départ *</label>
              <input
                type="date"
                required
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date d'arrivée *</label>
              <input
                type="date"
                required
                value={formData.arrivalDate}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Capacity and Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Capacité disponible (kg) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={formData.availableKg}
                onChange={(e) => setFormData({ ...formData, availableKg: e.target.value })}
                className="input-field"
                placeholder="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prix par kg (€) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.pricePerKg}
                onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                className="input-field"
                placeholder="5"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              placeholder="Informations supplémentaires sur votre trajet..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href={`/trips/${params.id}`}
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
