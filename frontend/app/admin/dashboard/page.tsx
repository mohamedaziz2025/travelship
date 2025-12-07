'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Send,
  Package,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import AdminSidebar from '@/components/admin/AdminSidebar'
import StatCard from '@/components/admin/StatCard'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface DashboardStats {
  users: {
    total: number
    senders: number
    shippers: number
  }
  announcements: {
    total: number
    active: number
    pending: number
    reported: number
  }
  reports: {
    pending: number
  }
  topCities: Array<{ city: string; count: number }>
  growth: {
    users: Array<{ date: string; count: number }>
    announcements: Array<{ date: string; count: number }>
  }
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    if (user?.role !== 'admin') {
      toast.error('Accès refusé - Vous devez être administrateur')
      router.push('/admin/login')
      return
    }

    loadStats()
  }, [isAuthenticated, user, router])

  const loadStats = async () => {
    try {
      const { data } = await adminApi.getDashboardStats()
      setStats(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard Admin
          </h1>
          <p className="text-gray-400">
            Vue d'ensemble de TravelShip - {new Date().toLocaleDateString('fr-FR')}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Utilisateurs"
            value={stats.users.total}
            subtitle={`${stats.users.senders} senders · ${stats.users.shippers} shippers`}
            icon={Users}
            color="blue"
            delay={0}
          />
          
          <StatCard
            title="Annonces Actives"
            value={stats.announcements.active}
            subtitle={`${stats.announcements.total} au total`}
            icon={FileText}
            color="green"
            delay={0.1}
          />
          
          <StatCard
            title="En Attente"
            value={stats.announcements.pending}
            subtitle="À modérer"
            icon={TrendingUp}
            color="orange"
            delay={0.2}
          />
          
          <StatCard
            title="Signalements"
            value={stats.reports.pending}
            subtitle={`${stats.announcements.reported} annonces signalées`}
            icon={AlertTriangle}
            color="red"
            delay={0.3}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User & Announcement Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Croissance (30 derniers jours)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.growth.users}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Utilisateurs"
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Cities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Top 5 Villes Populaires
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topCities}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Announcements Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Publications (30 derniers jours)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.growth.announcements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                name="Annonces"
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <button
            onClick={() => router.push('/admin/users')}
            className="group p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl hover:scale-105 transition-transform"
          >
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-semibold mb-1">Gérer les Utilisateurs</h4>
            <p className="text-gray-400 text-sm">Voir tous les utilisateurs</p>
          </button>

          <button
            onClick={() => router.push('/admin/announcements')}
            className="group p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl hover:scale-105 transition-transform"
          >
            <FileText className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-white font-semibold mb-1">Modérer les Annonces</h4>
            <p className="text-gray-400 text-sm">{stats.announcements.pending} en attente</p>
          </button>

          <button
            onClick={() => router.push('/admin/reports')}
            className="group p-6 bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-500/30 rounded-2xl hover:scale-105 transition-transform"
          >
            <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
            <h4 className="text-white font-semibold mb-1">Traiter les Signalements</h4>
            <p className="text-gray-400 text-sm">{stats.reports.pending} à traiter</p>
          </button>
        </motion.div>
      </main>
    </div>
  )
}
