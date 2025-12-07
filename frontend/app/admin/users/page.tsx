'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  Users,
  Ban,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DataTable from '@/components/admin/DataTable'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  role: string
  status: string
  country?: string
  city?: string
  verified: boolean
  createdAt: string
}

export default function UsersManagement() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadUsers()
  }, [pagination.page, filters])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (filters.search) params.search = filters.search
      if (filters.role !== 'all') params.role = filters.role
      if (filters.status !== 'all') params.status = filters.status

      const { data } = await adminApi.getUsers(params)
      setUsers(data.data)
      setPagination(data.pagination)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (userId: string) => {
    if (!confirm('Voulez-vous vraiment bloquer cet utilisateur ?')) return

    try {
      await adminApi.blockUser(userId)
      toast.success('Utilisateur bloqué avec succès')
      loadUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleUnblock = async (userId: string) => {
    try {
      await adminApi.unblockUser(userId)
      toast.success('Utilisateur débloqué avec succès')
      loadUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('ATTENTION: Cette action est irréversible. Supprimer cet utilisateur et toutes ses données ?')) return

    try {
      await adminApi.deleteUser(userId)
      toast.success('Utilisateur supprimé avec succès')
      loadUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Utilisateur',
      render: (user: User) => (
        <div>
          <div className="font-medium text-white">{user.name}</div>
          <div className="text-sm text-gray-400">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Localisation',
      render: (user: User) => (
        <div className="text-sm">
          {user.city && user.country
            ? `${user.city}, ${user.country}`
            : user.country || '-'}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Type',
      render: (user: User) => (
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${user.role === 'sender' ? 'bg-blue-500/20 text-blue-400' : ''}
          ${user.role === 'shipper' ? 'bg-green-500/20 text-green-400' : ''}
          ${user.role === 'both' ? 'bg-purple-500/20 text-purple-400' : ''}
        `}>
          {user.role === 'sender' ? 'Sender' : user.role === 'shipper' ? 'Shipper' : 'Les deux'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          {user.status === 'active' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span className={`
            text-sm font-medium
            ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}
          `}>
            {user.status === 'active' ? 'Actif' : 'Bloqué'}
          </span>
        </div>
      ),
    },
    {
      key: 'verified',
      label: 'Vérifié',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          {user.verified ? (
            <Shield className="w-4 h-4 text-blue-400" />
          ) : (
            <XCircle className="w-4 h-4 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      render: (user: User) => (
        <span className="text-sm text-gray-400">
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/users/${user._id}`)}
            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
            title="Voir le profil"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {user.status === 'active' ? (
            <button
              onClick={() => handleBlock(user._id)}
              className="p-2 hover:bg-orange-500/20 rounded-lg text-orange-400 transition-colors"
              title="Bloquer"
            >
              <Ban className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleUnblock(user._id)}
              className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
              title="Débloquer"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => handleDelete(user._id)}
            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

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
                <Users className="w-8 h-8 text-blue-400" />
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-400">
                {pagination.total} utilisateurs au total
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-4"
        >
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="sender">Senders</option>
            <option value="shipper">Shippers</option>
            <option value="both">Les deux</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les status</option>
            <option value="active">Actifs</option>
            <option value="blocked">Bloqués</option>
            <option value="suspended">Suspendus</option>
          </select>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={users}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            onSearch={(query) => setFilters({ ...filters, search: query })}
            searchPlaceholder="Rechercher par nom ou email..."
            loading={loading}
          />
        </motion.div>
      </main>
    </div>
  )
}
