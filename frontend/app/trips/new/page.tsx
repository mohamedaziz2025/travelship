'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plane, MapPin, Calendar, Package, FileText } from 'lucide-react'
import { tripsApi } from '@/lib/api'
import { LocationAutocomplete } from '@/components/location-autocomplete'
import { ErrorMessage } from '@/components/form/error-message'
import toast from 'react-hot-toast'
import {
  validateCity,
  validateCountry,
  validateDate,
  validateEndDate,
  validateNumber,
  validateDescription,
} from '@/lib/validation'

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Validation
  const validateField = (name: string, value: string) => {
    let error: string | undefined

    switch (name) {
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
      case 'departureDate':
        error = validateDate(value)
        break
      case 'arrivalDate':
        error = validateEndDate(formData.departureDate, value)
        break
      case 'availableKg':
        error = validateNumber(value, 'Le poids disponible')
        break
      case 'notes':
        error = value ? validateDescription(value, 10, 1000) : undefined
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

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, formData[name as keyof typeof formData])
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    const fromCityError = validateCity(formData.fromCity)
    if (fromCityError) newErrors.fromCity = fromCityError

    const fromCountryError = validateCountry(formData.fromCountry)
    if (fromCountryError) newErrors.fromCountry = fromCountryError

    const toCityError = validateCity(formData.toCity)
    if (toCityError) newErrors.toCity = toCityError

    const toCountryError = validateCountry(formData.toCountry)
    if (toCountryError) newErrors.toCountry = toCountryError

    const departureDateError = validateDate(formData.departureDate)
    if (departureDateError) newErrors.departureDate = departureDateError

    const arrivalDateError = validateEndDate(
      formData.departureDate,
      formData.arrivalDate
    )
    if (arrivalDateError) newErrors.arrivalDate = arrivalDateError

    const availableKgError = validateNumber(formData.availableKg, 'Le poids disponible')
    if (availableKgError) newErrors.availableKg = availableKgError

    if (formData.notes) {
      const notesError = validateDescription(formData.notes, 10, 1000)
      if (notesError) newErrors.notes = notesError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marquer tous les champs comme touchés
    setTouched({
      fromCity: true,
      fromCountry: true,
      toCity: true,
      toCountry: true,
      departureDate: true,
      arrivalDate: true,
      availableKg: true,
      notes: true,
    })

    // Valider le formulaire
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }
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
                Date de départ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.departureDate}
                onChange={(e) => handleChange('departureDate', e.target.value)}
                onBlur={() => handleBlur('departureDate')}
                min={new Date().toISOString().split('T')[0]}
                className={`input ${errors.departureDate && touched.departureDate ? 'border-red-500' : ''}`}
              />
              <ErrorMessage error={errors.departureDate} touched={touched.departureDate} />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date d'arrivée <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.arrivalDate}
                onChange={(e) => handleChange('arrivalDate', e.target.value)}
                onBlur={() => handleBlur('arrivalDate')}
                min={formData.departureDate || new Date().toISOString().split('T')[0]}
                className={`input ${errors.arrivalDate && touched.arrivalDate ? 'border-red-500' : ''}`}
              />
              <ErrorMessage error={errors.arrivalDate} touched={touched.arrivalDate} />
            </div>
          </div>

          {/* Available Weight */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              <Package className="inline w-4 h-4 mr-1" />
              Poids disponible (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={formData.availableKg}
              onChange={(e) => handleChange('availableKg', e.target.value)}
              onBlur={() => handleBlur('availableKg')}
              className={`input ${errors.availableKg && touched.availableKg ? 'border-red-500' : ''}`}
              placeholder="5"
            />
            <ErrorMessage error={errors.availableKg} touched={touched.availableKg} />
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
              onChange={(e) => handleChange('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
              className={`input min-h-[120px] ${errors.notes && touched.notes ? 'border-red-500' : ''}`}
              placeholder="Informations complémentaires sur votre voyage, restrictions, etc."
              maxLength={1000}
            />
            <div className="flex justify-between items-start">
              <ErrorMessage error={errors.notes} touched={touched.notes} />
              <p className="text-xs text-dark/60 mt-1">
                {formData.notes.length} / 1000
              </p>
            </div>
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
