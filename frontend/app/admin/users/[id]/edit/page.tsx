'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Loader,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface UserData {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  status: string
  country?: string
  city?: string
  verified: boolean
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UserData>({
    _id: '',
    name: '',
    email: '',
    phone: '',
    role: 'both',
    status: 'active',
    country: '',
    city: '',
    verified: false,
  })

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    loadUser()
  }, [isAuthenticated, currentUser, router])

  const loadUser = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getUserById(params.id as string)
      setFormData(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
      router.push('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await adminApi.updateUser(formData._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        role: formData.role,
        status: formData.status,
        verified: formData.verified,
      })
      toast.success('Utilisateur mis à jour')
      router.push(`/admin/users/${formData._id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white text-lg">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <AdminSidebar />

      <main className="flex-1 ml-[280px] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/admin/users/${formData._id}`)}
              className="p-2 bg-[#1e293b] border border-gray-700 rounded-lg hover:bg-[#2d3748] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Modifier Utilisateur</h1>
              <p className="text-gray-400 mt-1">{formData.name}</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom complet
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sender">Sender (Expéditeur)</option>
                <option value="shipper">Shipper (Transporteur)</option>
                <option value="both">Les deux</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statut du compte
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Actif</option>
                <option value="blocked">Bloqué</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>

            {/* Verified */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="verified"
                checked={formData.verified}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                className="w-5 h-5 bg-[#0f172a] border border-gray-700 rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="verified" className="text-gray-300">
                Email vérifié
              </label>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
