'use client'

import { MapPin, Calendar, DollarSign, Package, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface AnnouncementCardProps {
  announcement: {
    id: string
    type: 'package' | 'shopping'
    title?: string
    from: { city: string; country: string }
    to: { city: string; country: string }
    dateFrom: string
    dateTo: string
    reward: number
    description: string
    photos: string[]
    premium?: boolean
    user: {
      name: string
      avatarUrl?: string
      verified: boolean
      rating?: number
    }
  }
  className?: string
}

export function AnnouncementCard({ announcement, className }: AnnouncementCardProps) {
  return (
    <Link
      href={`/announcements/${announcement.id}`}
      className={cn('card group', className)}
    >
      {/* Image */}
      <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
        {announcement.photos[0] ? (
          <img
            src={announcement.photos[0]}
            alt="Announcement"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
            <Package className="w-16 h-16 text-white/50" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {announcement.premium && (
            <span className="badge-premium shadow-lg">Premium</span>
          )}
          {announcement.user.verified && (
            <span className="badge-verified shadow-lg">
              <CheckCircle className="w-3 h-3 mr-1" />
              Vérifié
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Type Badge */}
        <span className={cn(
          'badge',
          announcement.type === 'package' ? 'badge-info' : 'bg-purple-100 text-purple-700'
        )}>
          {announcement.type === 'package' ? '📦 Colis' : '🛍️ Achat'}
        </span>

        {/* Route */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-dark">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-semibold">
              {announcement.from.city}
            </span>
            <span className="text-dark-lighter">→</span>
            <span className="font-semibold">
              {announcement.to.city}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center space-x-2 text-sm text-dark-lighter">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(announcement.dateFrom)} - {formatDate(announcement.dateTo)}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-dark-lighter line-clamp-2">
          {announcement.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-light-darker">
          {/* User */}
          <div className="flex items-center space-x-2">
            {announcement.user.avatarUrl ? (
              <img
                src={announcement.user.avatarUrl}
                alt={announcement.user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {announcement.user.name[0]}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-dark">
                {announcement.user.name}
              </p>
              {announcement.user.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-dark-lighter">
                    {announcement.user.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-center space-x-1 text-accent font-bold">
            <DollarSign className="w-5 h-5" />
            <span>{formatCurrency(announcement.reward)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
