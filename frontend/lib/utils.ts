import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&bold=true`
}

export function calculateMatchScore(
  announcement: any,
  trip: any
): number {
  let score = 0

  // Location match (40 points)
  if (announcement.from.city === trip.from.city) score += 20
  if (announcement.to.city === trip.to.city) score += 20

  // Date overlap (30 points)
  const announcementStart = new Date(announcement.dateFrom)
  const announcementEnd = new Date(announcement.dateTo)
  const tripStart = new Date(trip.dateFrom)
  const tripEnd = new Date(trip.dateTo)

  if (tripStart <= announcementEnd && tripEnd >= announcementStart) {
    score += 30
  }

  // User rating (20 points)
  if (trip.userId?.stats?.rating) {
    score += Math.min(trip.userId.stats.rating * 4, 20)
  }

  // Verification status (10 points)
  if (trip.userId?.verified) {
    score += 10
  }

  return Math.min(score, 100)
}
