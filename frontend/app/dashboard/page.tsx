'use client'

import { SideBar } from '@/components/sidebar'
import { Package, Plane, MessageCircle, TrendingUp, Plus, Eye, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { announcementsApi, tripsApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Announcement {
  _id: string
  type: 'package' | 'shopping'
  from: { city: string; country: string }
  to: { city: string; country: string }
  dateFrom: string
  dateTo: string
  reward: number
  status: string
  views: number
  createdAt: string
}

interface Trip {
  _id: string
  from: { city: string; country: string }
  to: { city: string; country: string }
  departureDate: string
  availableKg: number
  status: string
  views: number
  createdAt: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [announcementsRes, tripsRes] = await Promise.all([
        announcementsApi.getMy(),
        tripsApi.getMy()
      ])

      if (announcementsRes.data.success) {
        setAnnouncements(announcementsRes.data.data.announcements)
      }
      if (tripsRes.data.success) {
        setTrips(tripsRes.data.data.trips)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { 
      label: 'Annonces actives', 
      value: announcements.filter(a => a.status === 'active').length.toString(), 
      icon: Package, 
      color: 'bg-primary' 
    },
    { 
      label: 'Trajets publiés', 
      value: trips.filter(t => t.status === 'active').length.toString(), 
      icon: Plane, 
      color: 'bg-secondary' 
    },
    { 
      label: 'Total annonces', 
      value: announcements.length.toString(), 
      icon: TrendingUp, 
      color: 'bg-accent' 
    },
    { 
      label: 'Total trajets', 
      value: trips.length.toString(), 
      icon: MessageCircle, 
      color: 'bg-green-600' 
    },
  ]

  const formatDate = (date: string) => {
    const now = new Date()
    const targetDate = new Date(date)
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Passé'
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Demain'
    return `Dans ${diffDays} jours`
  }

  const getRelativeTime = (date: string) => {
    const now = new Date()
    const createdDate = new Date(date)
    const diffTime = now.getTime() - createdDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return 'Il y a 1 jour'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  }

  return (
    <div className="min-h-screen bg-light">
      <SideBar />
      
      <div className="pl-20 lg:pl-64 pt-20">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-dark mb-2">
              Bonjour, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-dark-lighter">
              Bienvenue sur votre tableau de bord TravelShip
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              href="/announcements/new"
              className="card group bg-gradient-primary text-white hover:shadow-premium"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Créer une annonce</h3>
                  <p className="text-white/90">
                    Publiez un colis à envoyer ou un achat à effectuer
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
              </div>
            </Link>

            <Link
              href="/trips/new"
              className="card group bg-gradient-accent text-white hover:shadow-premium"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Créer un trajet</h3>
                  <p className="text-white/90">
                    Partagez votre prochain voyage et gagnez de l'argent
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8" />
                </div>
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-dark mb-1">{stat.value}</p>
                  <p className="text-sm text-dark-lighter">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Recent Activity */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-dark-lighter">Chargement...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Mes annonces */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mes annonces récentes</h2>
                  <Link href="/announcements" className="text-primary hover:underline">
                    Voir tout
                  </Link>
                </div>
                
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-dark-lighter mx-auto mb-3" />
                    <p className="text-dark-lighter mb-4">Aucune annonce pour le moment</p>
                    <Link href="/announcements/new" className="btn-primary inline-block">
                      Créer une annonce
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.slice(0, 3).map((announcement) => (
                      <Link 
                        key={announcement._id}
                        href={`/announcements/${announcement._id}`}
                        className="block p-4 bg-light-dark rounded-lg hover:bg-light-darker transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`badge ${
                            announcement.type === 'package' 
                              ? 'badge-info' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {announcement.type === 'package' ? '📦 Colis' : '🛍️ Achat'}
                          </span>
                          <span className="text-sm text-dark-lighter">
                            {getRelativeTime(announcement.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-dark mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {announcement.from.city} → {announcement.to.city}
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-lighter flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(announcement.dateFrom).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1 text-dark-lighter">
                            <Eye className="w-4 h-4" />
                            {announcement.views} vues
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mes trajets */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mes trajets récents</h2>
                  <Link href="/trips" className="text-primary hover:underline">
                    Voir tout
                  </Link>
                </div>
                
                {trips.length === 0 ? (
                  <div className="text-center py-8">
                    <Plane className="w-12 h-12 text-dark-lighter mx-auto mb-3" />
                    <p className="text-dark-lighter mb-4">Aucun trajet pour le moment</p>
                    <Link href="/trips/new" className="btn-primary inline-block">
                      Créer un trajet
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trips.slice(0, 3).map((trip) => (
                      <Link
                        key={trip._id}
                        href={`/trips/${trip._id}`}
                        className="block p-4 bg-light-dark rounded-lg hover:bg-light-darker transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="badge-verified">✈️ Trajet</span>
                          <span className="text-sm text-dark-lighter">
                            {formatDate(trip.departureDate)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-dark mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {trip.from.city} → {trip.to.city}
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-lighter flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {trip.availableKg} kg disponibles
                          </span>
                          <span className="flex items-center gap-1 text-dark-lighter">
                            <Eye className="w-4 h-4" />
                            {trip.views} vues
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
