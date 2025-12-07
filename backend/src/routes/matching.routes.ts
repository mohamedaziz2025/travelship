import { Router } from 'express'
import { protect } from '../middlewares/auth'
import {
  getMatchesForAnnouncement,
  getMatchesForTrip,
} from '../controllers/matching.controller'

const router = Router()

router.use(protect)

// @route   GET /api/v1/matches/announcements/:id
// @desc    Get compatible trips for an announcement
// @access  Private
router.get('/announcements/:id', getMatchesForAnnouncement)

// @route   GET /api/v1/matches/trips/:id
// @desc    Get compatible announcements for a trip
// @access  Private
router.get('/trips/:id', getMatchesForTrip)

export default router
