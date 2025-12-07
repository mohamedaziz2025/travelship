'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, MapPin, Calendar, Package, FileText } from 'lucide-react'
import { tripsApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fromCity: '',
    fromCountry: '',
    toCity: '',
    toCountry: '',
    departureDate: '',
    arrivalDate: '',
    availableKg: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        from: {
          city: formData.fromCity,
          country: formData.fromCountry,
          coordinates: [0, 0], // À remplacer par géocodage
        },
        to: {
          city: formData.toCity,
          country: formData.toCountry,
          coordinates: [0, 0], // À remplacer par géocodage
        },
        departureDate: new Date(formData.departureDate),
        arrivalDate: new Date(formData.arrivalDate),
        availableKg: Number(formData.availableKg),
        notes: formData.notes,
      }

      const response = await tripsApi.create(payload)

      if (response.data.success) {
        toast.success('Trajet créé avec succès !')
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
            Publier un trajet
          </h1>
          <p className="text-dark/60">
            Gagnez de l'argent en transportant des colis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Info Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Plane className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-dark mb-1">
                  Vous voyagez bientôt ?
                </p>
                <p className="text-sm text-dark/70">
                  Proposez votre espace de bagage disponible et gagnez de l'argent
                  en transportant des colis pour d'autres utilisateurs.
                </p>
              </div>
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
                placeholder="New York"
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
                placeholder="États-Unis"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date de départ
              </label>
              <input
                type="date"
                required
                value={formData.departureDate}
                onChange={(e) =>
                  setFormData({ ...formData, departureDate: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date d'arrivée
              </label>
              <input
                type="date"
                required
                value={formData.arrivalDate}
                onChange={(e) =>
                  setFormData({ ...formData, arrivalDate: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          {/* Available Weight */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <Package className="inline w-4 h-4 mr-1" />
              Poids disponible (kg)
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={formData.availableKg}
              onChange={(e) =>
                setFormData({ ...formData, availableKg: e.target.value })
              }
              className="input"
              placeholder="5"
            />
            <p className="text-xs text-dark/60 mt-1">
              Combien de kilos pouvez-vous transporter dans vos bagages ?
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Notes (optionnel)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="input min-h-[120px]"
              placeholder="Informations complémentaires sur votre voyage, restrictions, etc."
            />
          </div>

          {/* Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <p className="text-sm text-dark/80">
              💡 <strong>Conseil :</strong> Soyez précis sur vos dates et votre
              capacité de transport. Cela augmentera vos chances de trouver des
              correspondances.
            </p>
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
              {loading ? 'Publication...' : 'Publier le trajet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
