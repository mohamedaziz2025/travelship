'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Search, Bell, User, LogOut, Settings as SettingsIcon, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function NavBar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    toast.success('Déconnexion réussie')
    router.push('/login')
  }

  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Rechercher', href: '/search' },
    { label: 'Comment ça marche', href: '/how-it-works' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-light-darker">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gradient">ShipperTrip</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary' : 'text-dark-lighter'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 hover:bg-light-dark rounded-lg transition-colors">
                  <Search className="w-5 h-5 text-dark-lighter" />
                </button>
                <button className="p-2 hover:bg-light-dark rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-dark-lighter" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                </button>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-light-dark rounded-lg transition-colors"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-premium border border-light-darker animate-fade-in z-50">
                      <div className="p-3 border-b border-light-darker">
                        <p className="font-medium text-dark">{user?.name}</p>
                        <p className="text-sm text-dark/60">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-light-dark transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-dark/60" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-light-dark transition-colors"
                        >
                          <User className="w-4 h-4 text-dark/60" />
                          <span>Mon profil</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-light-dark transition-colors"
                        >
                          <SettingsIcon className="w-4 h-4 text-dark/60" />
                          <span>Paramètres</span>
                        </Link>
                      </div>
                      <div className="border-t border-light-darker py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-secondary"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-light-dark rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-dark" />
            ) : (
              <Menu className="w-6 h-6 text-dark" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-sm font-medium transition-colors py-2',
                    pathname === item.href ? 'text-primary' : 'text-dark-lighter'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-light-darker flex flex-col space-y-2">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary text-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary text-center"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="btn-primary text-center"
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
