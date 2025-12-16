'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail()
    } else {
      setStatus('error')
      setMessage('Token de vérification manquant')
    }
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await authApi.verifyEmail(token!)
      setStatus('success')
      setMessage('Votre email a été vérifié avec succès !')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      setStatus('error')
      setMessage(
        error.response?.data?.message || 
        'Le lien de vérification est invalide ou a expiré'
      )
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setResending(true)
    setResendSuccess(false)

    try {
      await authApi.resendVerification(email)
      setResendSuccess(true)
      setEmail('')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl shadow-premium p-8 mb-6">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
                <h1 className="text-2xl font-bold text-dark mb-2">
                  Vérification en cours...
                </h1>
                <p className="text-dark/60">
                  Veuillez patienter pendant que nous vérifions votre email
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-dark mb-2">
                  Email vérifié !
                </h1>
                <p className="text-dark/60 mb-4">{message}</p>
                <p className="text-sm text-dark/60">
                  Redirection vers la page de connexion...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-dark mb-2">
                  Erreur de vérification
                </h1>
                <p className="text-dark/60 mb-6">{message}</p>
                <button
                  onClick={() => router.push('/login')}
                  className="btn-primary w-full"
                >
                  Retour à la connexion
                </button>
              </>
            )}
          </div>
        </div>

        {/* Resend Verification Card */}
        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-premium p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-dark">
                Renvoyer l'email de vérification
              </h2>
            </div>

            {resendSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-green-700 font-medium">
                  Email envoyé avec succès !
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Vérifiez votre boîte de réception
                </p>
              </div>
            ) : (
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full px-4 py-3 border border-light-darker rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Renvoyer l'email
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-premium p-8">
          <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
          <p className="text-center text-dark/60">Chargement...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
