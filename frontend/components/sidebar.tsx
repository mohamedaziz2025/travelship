'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  Package,
  Plane,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, useUIStore } from '@/lib/store'

export function SideBar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { isSidebarOpen, toggleSidebar } = useUIStore()

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Search, label: 'Rechercher', href: '/search' },
    { icon: Package, label: 'Mes annonces', href: '/announcements' },
    { icon: Plane, label: 'Mes trajets', href: '/trips' },
    { icon: MessageCircle, label: 'Messages', href: '/chat' },
    { icon: User, label: 'Profil', href: '/profile' },
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ]

  const isAdmin = (user as any)?.role === 'admin'

  return (
    <aside
      className={cn(
        'fixed left-0 top-20 bottom-0 bg-white border-r border-light-darker transition-all duration-300 z-40',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-white border border-light-darker rounded-full p-1 hover:bg-light-dark transition-colors"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-dark-lighter" />
          ) : (
            <ChevronRight className="w-4 h-4 text-dark-lighter" />
          )}
        </button>

        {/* User Info */}
        <div className="p-4 border-b border-light-darker">
          <div className="flex items-center space-x-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-dark-lighter truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group',
                    isActive
                      ? 'bg-gradient-primary text-white shadow-premium'
                      : 'text-dark-lighter hover:bg-light-dark hover:text-primary'
                  )}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              )
            })}

            {isAdmin && (
              <>
                <div className="my-4 border-t border-light-darker" />
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all',
                    pathname.startsWith('/admin')
                      ? 'bg-accent text-dark shadow-lift'
                      : 'text-dark-lighter hover:bg-light-dark hover:text-accent'
                  )}
                  title={!isSidebarOpen ? 'Admin' : undefined}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">Admin</span>
                  )}
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-light-darker">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all w-full text-dark-lighter hover:bg-red-50 hover:text-red-600"
            title={!isSidebarOpen ? 'Déconnexion' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && (
              <span className="text-sm font-medium">Déconnexion</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
