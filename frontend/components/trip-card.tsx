'use client'

import { MapPin, Calendar, Package as PackageIcon, Star, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'

interface TripCardProps {
  trip: {
    id: string
    from: { city: string; country: string }
    to: { city: string; country: string }
    dateFrom: string
    dateTo: string
    availableKg: number
    notes?: string
    user: {
      name: string
      avatarUrl?: string
      verified: boolean
      rating?: number
      stats?: {
        completed: number
      }
    }
  }
  className?: string
}

export function TripCard({ trip, className }: TripCardProps) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className={cn('card group', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {trip.user.avatarUrl ? (
            <img
              src={trip.user.avatarUrl}
              alt={trip.user.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {trip.user.name[0]}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-dark">{trip.user.name}</p>
            <div className="flex items-center space-x-2">
              {trip.user.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-dark-lighter">
                    {trip.user.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {trip.user.verified && (
                <CheckCircle className="w-3 h-3 text-accent" />
              )}
            </div>
          </div>
        </div>

        {trip.user.stats && (
          <span className="badge-info">
            {trip.user.stats.completed} voyages
          </span>
        )}
      </div>

      {/* Route */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-semibold text-dark">
                {trip.from.city}
              </span>
            </div>
            <p className="text-xs text-dark-lighter ml-5">
              {trip.from.country}
            </p>
          </div>
          
          <div className="flex-shrink-0 px-4">
            <div className="w-12 h-px bg-gradient-primary relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-primary" />
              </div>
            </div>
          </div>

          <div className="flex-1 text-right">
            <div className="flex items-center justify-end space-x-2 mb-1">
              <span className="font-semibold text-dark">
                {trip.to.city}
              </span>
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-dark-lighter mr-5">
              {trip.to.country}
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-dark-lighter">
          <Calendar className="w-4 h-4 text-primary" />
          <span>
            {formatDate(trip.dateFrom)} - {formatDate(trip.dateTo)}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <PackageIcon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-dark">
            {trip.availableKg} kg disponibles
          </span>
        </div>
      </div>

      {/* Notes */}
      {trip.notes && (
        <div className="p-3 bg-light-dark rounded-lg">
          <p className="text-sm text-dark-lighter line-clamp-2">
            {trip.notes}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-light-darker">
        <button className="w-full btn-primary group-hover:shadow-premium transition-all">
          Voir les annonces compatibles
        </button>
      </div>
    </Link>
  )
}
