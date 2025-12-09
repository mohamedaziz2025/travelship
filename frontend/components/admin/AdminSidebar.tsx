'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  Settings,
  FileEdit,
  Shield,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  LogOut,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble',
  },
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    description: 'Gestion des utilisateurs',
  },
  {
    title: 'Annonces',
    href: '/admin/announcements',
    icon: FileText,
    description: 'Gestion des annonces',
  },
  {
    title: 'Conversations',
    href: '/admin/conversations',
    icon: MessageSquare,
    description: 'Discussions utilisateurs',
  },
  {
    title: 'Signalements',
    href: '/admin/reports',
    icon: AlertTriangle,
    description: 'Modération',
  },
  {
    title: 'Statistiques',
    href: '/admin/stats',
    icon: BarChart3,
    description: 'Analyses avancées',
  },
  {
    title: 'Pages',
    href: '/admin/pages',
    icon: FileEdit,
    description: 'Pages statiques',
  },
  {
    title: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuration',
  },
  {
    title: 'Admins',
    href: '/admin/admins',
    icon: Shield,
    description: 'Gestion des admins',
  },
]

export default function AdminSidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        logout()
        toast.success('Déconnexion réussie')
        router.push('/admin/login')
      } catch (error) {
        toast.error('Erreur lors de la déconnexion')
      }
    }
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] border-r border-gray-800 z-50 ${className}`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">ShipperTrip</h1>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </motion.div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-12rem)]">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <Icon className={`w-5 h-5 relative z-10 ${collapsed ? 'mx-auto' : ''}`} />
                
                {!collapsed && (
                  <div className="relative z-10 flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 bg-[#0f172a]">
        {!collapsed && user && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate">{user.name}</div>
                <div className="text-xs text-gray-400 truncate">{user.email}</div>
                <div className="text-xs text-blue-400 mt-0.5">
                  {user.adminRole === 'superadmin' ? '👑 Super Admin' : '🛡️ Modérateur'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Déconnexion</span>}
        </button>
      </div>
    </motion.aside>
  )
}
