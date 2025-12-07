'use client'

import { CheckCircle, Crown, Shield, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant: 'premium' | 'verified' | 'star' | 'admin'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ variant, size = 'md', className }: BadgeProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  switch (variant) {
    case 'premium':
      return (
        <span className={cn('badge-premium', textSizes[size], className)}>
          <Crown className={sizeClasses[size]} />
          <span>Premium</span>
        </span>
      )

    case 'verified':
      return (
        <span className={cn('badge-verified', textSizes[size], className)}>
          <CheckCircle className={sizeClasses[size]} />
          <span>Vérifié</span>
        </span>
      )

    case 'star':
      return (
        <span className={cn('badge bg-yellow-100 text-yellow-700', textSizes[size], className)}>
          <Star className={cn(sizeClasses[size], 'fill-yellow-500')} />
          <span>Top Shipper</span>
        </span>
      )

    case 'admin':
      return (
        <span className={cn('badge bg-red-100 text-red-700', textSizes[size], className)}>
          <Shield className={sizeClasses[size]} />
          <span>Admin</span>
        </span>
      )

    default:
      return null
  }
}
