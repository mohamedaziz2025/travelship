'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, MapPin, Calendar, DollarSign, FileText } from 'lucide-react'
import { announcementsApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'package' as 'package' | 'shopping',
    fromCity: '',
    fromCountry: '',
    toCity: '',
    toCountry: '',
    pickupDate: '',
    deliveryDate: '',
    reward: '',
    description: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        type: formData.type,
        from: {
          city: formData.fromCity,
          country: formData.fromCountry,
          coordinates: {
            lat: 0,
            lng: 0,
          },
        },
        to: {
          city: formData.toCity,
          country: formData.toCountry,
          coordinates: {
            lat: 0,
            lng: 0,
          },
        },
        dateFrom: new Date(formData.pickupDate),
        dateTo: new Date(formData.deliveryDate),
        reward: Number(formData.reward),
        description: formData.description,
        weight: Number(formData.weight) || undefined,
        dimensions: formData.dimensions.length
          ? {
              length: Number(formData.dimensions.length),
              width: Number(formData.dimensions.width),
              height: Number(formData.dimensions.height),
            }
          : undefined,
      }

      const response = await announcementsApi.create(payload)

      if (response.data.success) {
        toast.success('Annonce créée avec succès !')
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light py-24 px-4">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">
            Créer une annonce
          </h1>
          <p className="text-dark/60">
            Trouvez quelqu'un pour transporter votre colis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-dark mb-3">
              Type d'annonce
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'package' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'package'
                    ? 'border-primary bg-primary/10'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Colis existant</p>
                <p className="text-xs text-dark/60 mt-1">
                  J'ai un colis à envoyer
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'shopping' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'shopping'
                    ? 'border-primary bg-primary/10'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Shopping</p>
                <p className="text-xs text-dark/60 mt-1">
                  Demande d'achat
                </p>
              </button>
            </div>
          </div>

          {/* From */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Ville de départ
              </label>
              <input
                type="text"
                required
                value={formData.fromCity}
                onChange={(e) =>
                  setFormData({ ...formData, fromCity: e.target.value })
                }
                className="input"
                placeholder="Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Pays de départ
              </label>
              <input
                type="text"
                required
                value={formData.fromCountry}
                onChange={(e) =>
                  setFormData({ ...formData, fromCountry: e.target.value })
                }
                className="input"
                placeholder="France"
              />
            </div>
          </div>

          {/* To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Ville d'arrivée
              </label>
              <input
                type="text"
                required
                value={formData.toCity}
                onChange={(e) =>
                  setFormData({ ...formData, toCity: e.target.value })
                }
                className="input"
                placeholder="Lyon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Pays d'arrivée
              </label>
              <input
                type="text"
                required
                value={formData.toCountry}
                onChange={(e) =>
                  setFormData({ ...formData, toCountry: e.target.value })
                }
                className="input"
                placeholder="France"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date de collecte
              </label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) =>
                  setFormData({ ...formData, pickupDate: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date de livraison souhaitée
              </label>
              <input
                type="date"
                required
                value={formData.deliveryDate}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryDate: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          {/* Weight & Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="input"
                placeholder="2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Longueur (cm)
              </label>
              <input
                type="number"
                value={formData.dimensions.length}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, length: e.target.value },
                  })
                }
                className="input"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Largeur (cm)
              </label>
              <input
                type="number"
                value={formData.dimensions.width}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, width: e.target.value },
                  })
                }
                className="input"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Hauteur (cm)
              </label>
              <input
                type="number"
                value={formData.dimensions.height}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: { ...formData.dimensions, height: e.target.value },
                  })
                }
                className="input"
                placeholder="10"
              />
            </div>
          </div>

          {/* Reward */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Récompense proposée (€)
            </label>
            <input
              type="number"
              required
              value={formData.reward}
              onChange={(e) =>
                setFormData({ ...formData, reward: e.target.value })
              }
              className="input"
              placeholder="25"
            />
            <p className="text-xs text-dark/60 mt-1">
              Montant que vous êtes prêt à payer pour le transport
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input min-h-[120px]"
              placeholder="Décrivez votre colis, les précautions à prendre, etc."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Publier l\'annonce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
