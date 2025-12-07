'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  Shield,
  Crown,
  Users,
  Calendar,
  Mail,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DataTable from '@/components/admin/DataTable'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Admin {
  _id: string
  name: string
  email: string
  role: string
  adminRole: 'superadmin' | 'moderator'
  createdAt: string
}

export default function AdminsManagement() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadAdmins()
  }, [isAuthenticated, user, router])

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getAdmins()
      setAdmins(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (adminId: string, newRole: 'superadmin' | 'moderator') => {
    if (user?.adminRole !== 'superadmin') {
      toast.error('Seul un super admin peut modifier les rôles')
      return
    }

    if (!confirm(`Changer le rôle de cet admin en ${newRole === 'superadmin' ? 'Super Admin' : 'Modérateur'} ?`)) return

    try {
      await adminApi.updateAdminRole(adminId, newRole)
      toast.success('Rôle modifié avec succès')
      loadAdmins()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const columns = [
    {
      key: 'admin',
      label: 'Administrateur',
      render: (admin: Admin) => (
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${admin.adminRole === 'superadmin'
              ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }
          `}>
            {admin.adminRole === 'superadmin' ? (
              <Crown className="w-6 h-6 text-white" />
            ) : (
              <Shield className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <div className="font-medium text-white">{admin.name}</div>
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {admin.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (admin: Admin) => (
        <div>
          {admin.adminRole === 'superadmin' ? (
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 rounded-full text-sm font-medium inline-flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Super Admin
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium inline-flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Modérateur
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (admin: Admin) => (
        <div className="text-sm text-gray-400">
          {admin.adminRole === 'superadmin' ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Accès complet
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Gestion des admins
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Paramètres système
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-blue-400">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Modération annonces
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Gestion signalements
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                Statistiques limitées
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Membre depuis',
      render: (admin: Admin) => (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          {new Date(admin.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (admin: Admin) => (
        <div className="flex items-center gap-2">
          {user?.adminRole === 'superadmin' && admin._id !== user.id && (
            <select
              value={admin.adminRole}
              onChange={(e) => handleUpdateRole(admin._id, e.target.value as any)}
              className="px-3 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="superadmin">Super Admin</option>
              <option value="moderator">Modérateur</option>
            </select>
          )}
          {admin._id === user?.id && (
            <span className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-lg text-sm">
              Vous
            </span>
          )}
        </div>
      ),
    },
  ]

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

  const superAdminCount = admins.filter(a => a.adminRole === 'superadmin').length
  const moderatorCount = admins.filter(a => a.adminRole === 'moderator').length

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <AdminSidebar />

      <main className="flex-1 ml-[280px] p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                Gestion des Administrateurs
              </h1>
              <p className="text-gray-400">
                {admins.length} administrateurs · {superAdminCount} super admins · {moderatorCount} modérateurs
              </p>
            </div>

            {user?.adminRole === 'superadmin' && (
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium shadow-lg">
                <Plus className="w-5 h-5" />
                Ajouter un Admin
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6"
          >
            <Crown className="w-10 h-10 text-yellow-400 mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">{superAdminCount}</h3>
            <p className="text-yellow-400 font-medium">Super Admins</p>
            <p className="text-gray-400 text-sm mt-2">Accès complet au système</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6"
          >
            <Shield className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">{moderatorCount}</h3>
            <p className="text-blue-400 font-medium">Modérateurs</p>
            <p className="text-gray-400 text-sm mt-2">Modération et gestion</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
          >
            <Users className="w-10 h-10 text-green-400 mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">{admins.length}</h3>
            <p className="text-green-400 font-medium">Total Admins</p>
            <p className="text-gray-400 text-sm mt-2">Équipe administrative</p>
          </motion.div>
        </div>

        {/* Info Card */}
        {user?.adminRole !== 'superadmin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-400 font-medium mb-1">Permissions Limitées</p>
              <p className="text-gray-400 text-sm">
                Seuls les Super Admins peuvent modifier les rôles des autres administrateurs.
              </p>
            </div>
          </motion.div>
        )}

        {/* Admins Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <DataTable
            columns={columns}
            data={admins}
            loading={loading}
          />
        </motion.div>

        {/* Roles Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Super Admin</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Accès complet à toutes les fonctionnalités</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Peut ajouter, modifier et supprimer des admins</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Gestion des paramètres système</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Toutes les statistiques et rapports</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Modérateur</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Valider et supprimer les annonces</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Gérer les signalements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Voir les statistiques limitées</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Pas d'accès aux paramètres système</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
