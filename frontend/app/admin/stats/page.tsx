'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  MapPin,
  Globe,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

interface AdvancedStats {
  userGrowth: Array<{ month: string; count: number }>
  announcementGrowth: Array<{ month: string; count: number }>
  topCountries: Array<{ country: string; count: number }>
  topDestinations: Array<{ from: string; to: string; count: number }>
  typeDistribution: Array<{ type: string; count: number }>
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export default function AdvancedStats() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState<AdvancedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'6months' | '1year'>('6months')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadStats()
  }, [isAuthenticated, user, router, period])

  const loadStats = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getAdvancedStats()
      setStats(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white text-lg">Chargement des statistiques...</span>
        </div>
      </div>
    )
  }

  // Calculate trends
  const userTrend = stats.userGrowth.length >= 2
    ? ((stats.userGrowth[stats.userGrowth.length - 1].count - stats.userGrowth[stats.userGrowth.length - 2].count) / 
       stats.userGrowth[stats.userGrowth.length - 2].count * 100)
    : 0

  const announcementTrend = stats.announcementGrowth.length >= 2
    ? ((stats.announcementGrowth[stats.announcementGrowth.length - 1].count - 
        stats.announcementGrowth[stats.announcementGrowth.length - 2].count) / 
       stats.announcementGrowth[stats.announcementGrowth.length - 2].count * 100)
    : 0

  // Prepare data for type distribution pie chart
  const typeData = stats.typeDistribution.map(item => ({
    name: item.type === 'package' ? 'Colis' : 'Achats',
    value: item.count,
  }))

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
                <BarChart3 className="w-8 h-8 text-blue-400" />
                Statistiques Avancées
              </h1>
              <p className="text-gray-400">
                Analyses détaillées et tendances de la plateforme
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('6months')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  period === '6months'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-[#1e293b] text-gray-400 hover:text-white'
                }`}
              >
                6 mois
              </button>
              <button
                onClick={() => setPeriod('1year')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  period === '1year'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-[#1e293b] text-gray-400 hover:text-white'
                }`}
              >
                1 an
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trend Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Croissance Utilisateurs"
            value={`${userTrend > 0 ? '+' : ''}${userTrend.toFixed(1)}%`}
            subtitle="Par rapport au mois dernier"
            icon={userTrend > 0 ? ArrowUpRight : ArrowDownRight}
            color={userTrend > 0 ? 'green' : 'red'}
            trend={{ value: userTrend, isPositive: userTrend > 0 }}
            delay={0}
          />

          <StatCard
            title="Croissance Annonces"
            value={`${announcementTrend > 0 ? '+' : ''}${announcementTrend.toFixed(1)}%`}
            subtitle="Par rapport au mois dernier"
            icon={announcementTrend > 0 ? ArrowUpRight : ArrowDownRight}
            color={announcementTrend > 0 ? 'green' : 'red'}
            trend={{ value: announcementTrend, isPositive: announcementTrend > 0 }}
            delay={0.1}
          />

          <StatCard
            title="Pays Actifs"
            value={stats.topCountries.length}
            subtitle="Pays avec des annonces"
            icon={Globe}
            color="purple"
            delay={0.2}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Croissance Utilisateurs
              </h3>
              <span className="text-sm text-gray-400">6 derniers mois</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Announcement Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Croissance Annonces
              </h3>
              <span className="text-sm text-gray-400">6 derniers mois</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.announcementGrowth}>
                <defs>
                  <linearGradient id="colorAnnouncements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorAnnouncements)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Top 10 Pays
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.topCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="country" type="category" stroke="#9ca3af" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Distribution par Type
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            Top 10 Destinations Populaires
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Départ</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">→</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Arrivée</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Trajets</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">Popularité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {stats.topDestinations.slice(0, 10).map((dest, index) => {
                  const maxCount = Math.max(...stats.topDestinations.map(d => d.count))
                  const popularity = (dest.count / maxCount) * 100
                  
                  return (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="hover:bg-[#1e293b] transition-colors"
                    >
                      <td className="px-4 py-4 text-gray-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-white font-medium">
                        {dest.from}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-blue-400">→</span>
                      </td>
                      <td className="px-4 py-4 text-white font-medium">
                        {dest.to}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                          {dest.count}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${popularity}%` }}
                              transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                          </div>
                          <span className="text-sm text-gray-400 w-12 text-right">
                            {popularity.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
            <Calendar className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Meilleur Mois</h4>
            <p className="text-2xl font-bold text-blue-400">
              {stats.announcementGrowth.reduce((max, curr) => 
                curr.count > max.count ? curr : max
              ).month}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.announcementGrowth.reduce((max, curr) => 
                curr.count > max.count ? curr : max
              ).count} annonces
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
            <Globe className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Pays Principal</h4>
            <p className="text-2xl font-bold text-green-400">
              {stats.topCountries[0]?.country || 'N/A'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.topCountries[0]?.count || 0} annonces
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
            <MapPin className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Route Populaire</h4>
            <p className="text-lg font-bold text-purple-400">
              {stats.topDestinations[0]?.from} → {stats.topDestinations[0]?.to}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats.topDestinations[0]?.count || 0} trajets
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
