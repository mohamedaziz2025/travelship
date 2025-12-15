'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateName,
  validatePhone,
} from '@/lib/validation'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'both' as 'sender' | 'shipper' | 'both',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Validation en temps réel
  const validateField = (name: string, value: string) => {
    let error: string | undefined

    switch (name) {
      case 'name':
        error = validateName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        break
      case 'confirmPassword':
        error = validatePasswordConfirm(formData.password, value)
        break
      case 'phone':
        error = validatePhone(value)
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
    validateField(name, formData[name as keyof typeof formData] as string)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marquer tous les champs comme touchés
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
    })

    // Valider tous les champs
    const nameError = validateName(formData.name)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validatePasswordConfirm(
      formData.password,
      formData.confirmPassword
    )
    const phoneError = validatePhone(formData.phone)

    const validationErrors: { [key: string]: string } = {}
    if (nameError) validationErrors.name = nameError
    if (emailError) validationErrors.email = emailError
    if (passwordError) validationErrors.password = passwordError
    if (confirmPasswordError)
      validationErrors.confirmPassword = confirmPasswordError
    if (phoneError) validationErrors.phone = phoneError

    setErrors(validationErrors)

    // Si il y a des erreurs, arrêter
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Veuillez corriger les erreurs dans le formulaire')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role,
      })

      if (response.data.success) {
        toast.success('Compte créé avec succès ! Vérifiez votre email pour activer votre compte.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-premium animate-fade-in">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-white/70">
              Rejoignez la communauté ShipperTrip
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nom complet <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full pl-11 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                    errors.name && touched.name
                      ? 'border-red-500'
                      : 'border-white/20'
                  }`}
                  placeholder="Jean Dupont"
                />
              </div>
              {errors.name && touched.name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-11 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.email && touched.email
                        ? 'border-red-500'
                        : 'border-white/20'
                    }`}
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Téléphone (optionnel)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={`w-full pl-11 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.phone && touched.phone
                        ? 'border-red-500'
                        : 'border-white/20'
                    }`}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Mot de passe <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-11 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.password && touched.password
                        ? 'border-red-500'
                        : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirmer le mot de passe <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange('confirmPassword', e.target.value)
                    }
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full pl-11 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500'
                        : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Je souhaite
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'sender' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'sender'
                      ? 'border-accent bg-accent/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-white font-medium mb-1">Expéditeur</p>
                  <p className="text-white/60 text-xs">
                    Envoyer des colis
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'shipper' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'shipper'
                      ? 'border-accent bg-accent/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-white font-medium mb-1">Voyageur</p>
                  <p className="text-white/60 text-xs">
                    Transporter des colis
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'both' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'both'
                      ? 'border-accent bg-accent/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="text-white font-medium mb-1">Les deux</p>
                  <p className="text-white/60 text-xs">
                    Envoyer et transporter
                  </p>
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start text-sm text-white/70 cursor-pointer">
              <input type="checkbox" required className="mr-2 mt-1 rounded" />
              <span>
                J'accepte les{' '}
                <Link href="/terms" className="text-accent hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-accent hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/50">ou</span>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-white/70">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="text-accent hover:text-accent-dark font-medium transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
