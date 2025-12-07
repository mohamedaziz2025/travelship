import { Response, NextFunction } from 'express'
import { Announcement } from '../models/Announcement'
import { Trip } from '../models/Trip'
import { AppError } from '../middlewares/errorHandler'
import { AuthRequest } from '../middlewares/auth'

// Calculate match score between announcement and trip
const calculateMatchScore = (announcement: any, trip: any): number => {
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

// @desc    Get compatible trips for an announcement
// @route   GET /api/v1/matches/announcements/:id
export const getMatchesForAnnouncement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcement = await Announcement.findById(req.params.id)

    if (!announcement) {
      return next(new AppError('Annonce non trouvée', 404))
    }

    // Find compatible trips
    const trips = await Trip.find({
      'from.city': announcement.from.city,
      'to.city': announcement.to.city,
      status: 'active',
      dateFrom: { $lte: announcement.dateTo },
      dateTo: { $gte: announcement.dateFrom },
    })
      .populate('userId', 'name email avatarUrl verified stats badges')
      .lean()

    // Calculate match scores
    const matches = trips
      .map((trip) => ({
        trip,
        score: calculateMatchScore(announcement, trip),
      }))
      .sort((a, b) => b.score - a.score)

    res.json({
      success: true,
      data: { matches },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get compatible announcements for a trip
// @route   GET /api/v1/matches/trips/:id
export const getMatchesForTrip = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trip = await Trip.findById(req.params.id)

    if (!trip) {
      return next(new AppError('Trajet non trouvé', 404))
    }

    // Find compatible announcements
    const announcements = await Announcement.find({
      'from.city': trip.from.city,
      'to.city': trip.to.city,
      status: 'active',
      dateFrom: { $lte: trip.dateTo },
      dateTo: { $gte: trip.dateFrom },
    })
      .populate('userId', 'name email avatarUrl verified stats badges')
      .lean()

    // Calculate match scores
    const matches = announcements
      .map((announcement) => ({
        announcement,
        score: calculateMatchScore(announcement, trip),
      }))
      .sort((a, b) => b.score - a.score)

    res.json({
      success: true,
      data: { matches },
    })
  } catch (error) {
    next(error)
  }
}
