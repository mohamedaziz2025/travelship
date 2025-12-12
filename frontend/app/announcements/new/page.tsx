'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, MapPin, Calendar, DollarSign, FileText, Plane, Ship, Train, Car, Phone, Upload } from 'lucide-react'
import { announcementsApi } from '@/lib/api'
import { LocationAutocomplete } from '@/components/location-autocomplete'
import { ErrorMessage } from '@/components/form/error-message'
import toast from 'react-hot-toast'
import {
  validateCity,
  validateCountry,
  validateDate,
  validateEndDate,
  validateReward,
  validateDescription,
  validateTitle,
  validatePhone,
  validateWeight,
} from '@/lib/validation'

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Validation
  const validateField = (name: string, value: any) => {
    let error: string | undefined

    switch (name) {
      case 'title':
        error = validateTitle(value)
        break
      case 'fromCity':
        error = validateCity(value)
        break
      case 'fromCountry':
        error = validateCountry(value)
        break
      case 'toCity':
        error = validateCity(value)
        break
      case 'toCountry':
        error = validateCountry(value)
        break
      case 'pickupDate':
        error = validateDate(value)
        break
      case 'deliveryDate':
        error = validateEndDate(formData.pickupDate, value)
        break
      case 'reward':
        error = validateReward(value)
        break
      case 'description':
        error = validateDescription(value)
        break
      case 'phoneNumber':
        error = validatePhone(value)
        break
      case 'weight':
        error = validateWeight(value)
        break
    }

    setErrors((prev) => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[name] = error
      } else {
        delete newErrors[name]
      }
      return newErrors
    })
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const value = name.includes('.')
      ? formData.dimensions[name.split('.')[1] as keyof typeof formData.dimensions]
      : formData[name as keyof typeof formData]
    validateField(name, value)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    const titleError = validateTitle(formData.title)
    if (titleError) newErrors.title = titleError

    const fromCityError = validateCity(formData.fromCity)
    if (fromCityError) newErrors.fromCity = fromCityError

    const fromCountryError = validateCountry(formData.fromCountry)
    if (fromCountryError) newErrors.fromCountry = fromCountryError

    const toCityError = validateCity(formData.toCity)
    if (toCityError) newErrors.toCity = toCityError

    const toCountryError = validateCountry(formData.toCountry)
    if (toCountryError) newErrors.toCountry = toCountryError

    const pickupDateError = validateDate(formData.pickupDate)
    if (pickupDateError) newErrors.pickupDate = pickupDateError

    const deliveryDateError = validateEndDate(
      formData.pickupDate,
      formData.deliveryDate
    )
    if (deliveryDateError) newErrors.deliveryDate = deliveryDateError

    const rewardError = validateReward(formData.reward)
    if (rewardError) newErrors.reward = rewardError

    const descriptionError = validateDescription(formData.description)
    if (descriptionError) newErrors.description = descriptionError

    if (formData.phoneNumber) {
      const phoneError = validatePhone(formData.phoneNumber)
      if (phoneError) newErrors.phoneNumber = phoneError
    }

    if (formData.weight) {
      const weightError = validateWeight(formData.weight)
      if (weightError) newErrors.weight = weightError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marquer tous les champs comme touchés
    setTouched({
      title: true,
      fromCity: true,
      fromCountry: true,
      toCity: true,
      toCountry: true,
      pickupDate: true,
      deliveryDate: true,
      reward: true,
      description: true,
      phoneNumber: true,
      weight: true,
    })

    // Valider le formulaire
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }
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
                Titre de l'annonce <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                className={`input ${errors.title && touched.title ? 'border-red-500' : ''}`}
                placeholder="Ex: Envoi de documents importants"
              />
              <ErrorMessage error={errors.title} touched={touched.title} />
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
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Lieu de départ <span className="text-red-500">*</span>
            </label>
            <LocationAutocomplete
              value={formData.fromCity && formData.fromCountry ? `${formData.fromCity}, ${formData.fromCountry}` : formData.fromCity}
              onChange={(value) => {
                // Seulement parser quand une suggestion a été sélectionnée (contient ", ")
                if (value.includes(', ')) {
                  const parts = value.split(', ')
                  const newData = {
                    ...formData,
                    fromCity: parts[0] || '',
                    fromCountry: parts.slice(1).join(', ') || '',
                  }
                  setFormData(newData)
                  if (touched.fromCity) {
                    validateField('fromCity', parts[0] || '')
                    validateField('fromCountry', parts.slice(1).join(', ') || '')
                  }
                } else {
                  // Pendant la saisie, garder juste la ville
                  setFormData({
                    ...formData,
                    fromCity: value,
                    fromCountry: '',
                  })
                }
              }}
              placeholder="Rechercher une ville..."
              className={`${(errors.fromCity || errors.fromCountry) && (touched.fromCity || touched.fromCountry) ? 'border-red-500' : ''}`}
            />
            <ErrorMessage error={errors.fromCity || errors.fromCountry} touched={touched.fromCity || touched.fromCountry} />
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Lieu d'arrivée <span className="text-red-500">*</span>
            </label>
            <LocationAutocomplete
              value={formData.toCity && formData.toCountry ? `${formData.toCity}, ${formData.toCountry}` : formData.toCity}
              onChange={(value) => {
                // Seulement parser quand une suggestion a été sélectionnée (contient ", ")
                if (value.includes(', ')) {
                  const parts = value.split(', ')
                  const newData = {
                    ...formData,
                    toCity: parts[0] || '',
                    toCountry: parts.slice(1).join(', ') || '',
                  }
                  setFormData(newData)
                  if (touched.toCity) {
                    validateField('toCity', parts[0] || '')
                    validateField('toCountry', parts.slice(1).join(', ') || '')
                  }
                } else {
                  // Pendant la saisie, garder juste la ville
                  setFormData({
                    ...formData,
                    toCity: value,
                    toCountry: '',
                  })
                }
              }}
              placeholder="Rechercher une ville..."
              className={`${(errors.toCity || errors.toCountry) && (touched.toCity || touched.toCountry) ? 'border-red-500' : ''}`}
            />
            <ErrorMessage error={errors.toCity || errors.toCountry} touched={touched.toCity || touched.toCountry} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                {userType === 'shipper' ? 'Date du voyage' : 'Date de début'} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.pickupDate}
                onChange={(e) => handleChange('pickupDate', e.target.value)}
                onBlur={() => handleBlur('pickupDate')}
                min={new Date().toISOString().split('T')[0]}
                className={`input ${errors.pickupDate && touched.pickupDate ? 'border-red-500' : ''}`}
              />
              <ErrorMessage error={errors.pickupDate} touched={touched.pickupDate} />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                {userType === 'shipper' ? 'Date de retour (optionnel)' : 'Date de fin'} {userType === 'sender' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                required={userType === 'sender'}
                value={formData.deliveryDate}
                onChange={(e) => handleChange('deliveryDate', e.target.value)}
                onBlur={() => handleBlur('deliveryDate')}
                min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                className={`input ${errors.deliveryDate && touched.deliveryDate ? 'border-red-500' : ''}`}
              />
              <ErrorMessage error={errors.deliveryDate} touched={touched.deliveryDate} />
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
                : 'Prix proposé (€)'} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.reward}
              onChange={(e) => handleChange('reward', e.target.value)}
              onBlur={() => handleBlur('reward')}
              className={`input ${errors.reward && touched.reward ? 'border-red-500' : ''}`}
              placeholder="25"
            />
            <ErrorMessage error={errors.reward} touched={touched.reward} />
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
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              className={`input min-h-[120px] ${errors.description && touched.description ? 'border-red-500' : ''}`}
              placeholder={userType === 'shipper' 
                ? 'Décrivez votre voyage, vos conditions, etc.'
                : 'Décrivez votre colis, les précautions à prendre, etc.'}
              maxLength={500}
            />
            <div className="flex justify-between items-start">
              <ErrorMessage error={errors.description} touched={touched.description} />
              <p className="text-xs text-dark/60 mt-1">
                {formData.description.length} / 500
              </p>
            </div>
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
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              onBlur={() => handleBlur('phoneNumber')}
              className={`input ${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}`}
              placeholder="+33 6 12 34 56 78"
            />
            <ErrorMessage error={errors.phoneNumber} touched={touched.phoneNumber} />
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
