'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { User, Mail, Phone, MapPin, Star, Package, Plane, Award } from 'lucide-react'
import { usersApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const response = await usersApi.updateMe(formData)
      if (response.data.success) {
        setUser(response.data.data)
        setEditing(false)
        toast.success('Profil mis à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light py-24 px-4">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              {!editing ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    {user.verified && (
                      <span className="badge-verified">
                        Vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-dark/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary"
                  >
                    Modifier le profil
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold">{user.stats?.matches || 0}</p>
            <p className="text-sm text-dark/60">Matches</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-bold">
              {user.stats?.rating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-dark/60">Note moyenne</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
              <Plane className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-2xl font-bold">{user.stats?.completed || 0}</p>
            <p className="text-sm text-dark/60">Complétés</p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold">{user.badges?.length || 0}</p>
            <p className="text-sm text-dark/60">Badges</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Type de compte</h2>
          <div className="flex gap-3">
            {user.role === 'sender' && (
              <span className="badge-info">Expéditeur</span>
            )}
            {user.role === 'shipper' && (
              <span className="badge-info">Voyageur</span>
            )}
            {user.role === 'both' && (
              <>
                <span className="badge-info">Expéditeur</span>
                <span className="badge-info">Voyageur</span>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        {user.badges && user.badges.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Badges obtenus</h2>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, index) => (
                <span key={index} className="badge-premium">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
