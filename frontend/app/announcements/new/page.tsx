'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, MapPin, Calendar, DollarSign, FileText, Plane, Ship, Train, Car, Phone, Upload } from 'lucide-react'
import { announcementsApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'shipper' | 'sender'>('sender')
  const [formData, setFormData] = useState({
    type: 'package' as 'package' | 'shopping',
    packageType: 'personal' as 'personal' | 'purchase' | 'both',
    title: '',
    fromCity: '',
    fromCountry: '',
    toCity: '',
    toCountry: '',
    pickupDate: '',
    deliveryDate: '',
    transportType: 'plane' as 'plane' | 'boat' | 'train' | 'car',
    weightRange: '0-1' as '0-1' | '2-5' | '5-10' | '10-15' | '15-20' | '20-25' | '25-30' | '30+',
    serviceType: 'paid' as 'paid' | 'free',
    reward: '',
    description: '',
    phoneNumber: '',
    isUrgent: false,
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
      const payload: any = {
        userType,
        type: formData.type,
        packageType: formData.packageType,
        title: formData.title || undefined,
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
        weightRange: formData.weightRange,
        reward: Number(formData.reward),
        description: formData.description,
        phoneNumber: formData.phoneNumber || undefined,
        weight: Number(formData.weight) || undefined,
        dimensions: formData.dimensions.length
          ? {
              length: Number(formData.dimensions.length),
              width: Number(formData.dimensions.width),
              height: Number(formData.dimensions.height),
            }
          : undefined,
      }

      // Champs spécifiques Shipper
      if (userType === 'shipper') {
        payload.transportType = formData.transportType
        payload.serviceType = formData.serviceType
      }

      // Champs spécifiques Sender
      if (userType === 'sender') {
        payload.isUrgent = formData.isUrgent
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
            {userType === 'shipper' 
              ? 'Je propose de transporter des colis' 
              : 'Je cherche quelqu\'un pour transporter mon colis'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Type d'utilisateur */}
          <div>
            <label className="block text-sm font-medium text-dark mb-3">
              Je suis
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType('sender')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'sender'
                    ? 'border-primary bg-primary/10'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Sender</p>
                <p className="text-xs text-dark/60 mt-1">
                  J'envoie un colis
                </p>
              </button>

              <button
                type="button"
                onClick={() => setUserType('shipper')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  userType === 'shipper'
                    ? 'border-primary bg-primary/10'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <Plane className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="font-medium">Shipper</p>
                <p className="text-xs text-dark/60 mt-1">
                  Je voyage et transporte
                </p>
              </button>
            </div>
          </div>

          {/* Titre (pour Sender uniquement) */}
          {userType === 'sender' && (
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Titre de l'annonce
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input"
                placeholder="Ex: Envoi de documents importants"
              />
            </div>
          )}

          {/* Type de colis */}
          <div>
            <label className="block text-sm font-medium text-dark mb-3">
              {userType === 'shipper' ? 'Type de colis accepté' : 'Type de colis'}
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, packageType: 'personal' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.packageType === 'personal'
                    ? 'border-primary bg-primary/10'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-sm">Colis personnel</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, packageType: 'purchase' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.packageType === 'purchase'
                    ? 'border-primary bg-primary/10'
                    : 'border-light-darker hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-sm">Achat</p>
              </button>

              {userType === 'shipper' && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, packageType: 'both' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.packageType === 'both'
                      ? 'border-primary bg-primary/10'
                      : 'border-light-darker hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium text-sm">Les deux</p>
                </button>
              )}
            </div>
          </div>

          {/* Moyen de transport (Shipper uniquement) */}
          {userType === 'shipper' && (
            <div>
              <label className="block text-sm font-medium text-dark mb-3">
                Moyen de transport
              </label>
              <div className="grid grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportType: 'plane' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.transportType === 'plane'
                      ? 'border-primary bg-primary/10'
                      : 'border-light-darker hover:border-primary/50'
                  }`}
                >
                  <Plane className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="font-medium text-xs">Avion</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportType: 'boat' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.transportType === 'boat'
                      ? 'border-primary bg-primary/10'
                      : 'border-light-darker hover:border-primary/50'
                  }`}
                >
                  <Ship className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="font-medium text-xs">Bateau</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportType: 'train' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.transportType === 'train'
                      ? 'border-primary bg-primary/10'
                      : 'border-light-darker hover:border-primary/50'
                  }`}
                >
                  <Train className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="font-medium text-xs">Train</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transportType: 'car' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.transportType === 'car'
                      ? 'border-primary bg-primary/10'
                      : 'border-light-darker hover:border-primary/50'
                  }`}
                >
                  <Car className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="font-medium text-xs">Voiture</p>
                </button>
              </div>
            </div>
          )}

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
                {userType === 'shipper' ? 'Date du voyage' : 'Date de début'}
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
                {userType === 'shipper' ? 'Date de retour (optionnel)' : 'Date de fin'}
              </label>
              <input
                type="date"
                required={userType === 'sender'}
                value={formData.deliveryDate}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryDate: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          {/* Plage de poids */}
          <div>
            <label className="block text-sm font-medium text-dark mb-3">
              {userType === 'shipper' ? 'Poids disponible' : 'Poids du colis'}
            </label>
            <select
              required
              value={formData.weightRange}
              onChange={(e) =>
                setFormData({ ...formData, weightRange: e.target.value as any })
              }
              className="input"
            >
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

          {/* Weight & Dimensions (optionnel) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Poids exact (kg) - optionnel
              </label>
              <input
                type="number"
                step="0.1"
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

          {/* Type de service (Shipper uniquement) */}
          {userType === 'shipper' && (
            <div>
              <label className="block text-sm font-medium text-dark mb-3">
                Type de service
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, serviceType: 'paid' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.serviceType === 'paid'
                      ? 'border-primary bg-primary/10'
                      : 'border-light-darker hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">Rémunéré</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, serviceType: 'free' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.serviceType === 'free'
                      ? 'border-primary bg-primary/10'
                      : 'border-light-darker hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">Gratuit</p>
                </button>
              </div>
            </div>
          )}

          {/* Reward */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              {userType === 'shipper' 
                ? 'Prix demandé (€)' 
                : 'Prix proposé (€)'}
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
              {userType === 'shipper'
                ? 'Montant que vous demandez pour le transport'
                : 'Montant que vous êtes prêt à payer'}
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
              placeholder={userType === 'shipper' 
                ? 'Décrivez votre voyage, vos conditions, etc.'
                : 'Décrivez votre colis, les précautions à prendre, etc.'}
            />
          </div>

          {/* Numéro de téléphone (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              Numéro de téléphone (optionnel)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="input"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          {/* Urgent (Sender uniquement) */}
          {userType === 'sender' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isUrgent"
                checked={formData.isUrgent}
                onChange={(e) =>
                  setFormData({ ...formData, isUrgent: e.target.checked })
                }
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isUrgent" className="text-sm font-medium text-dark">
                🚨 Annonce urgente
              </label>
            </div>
          )}

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
