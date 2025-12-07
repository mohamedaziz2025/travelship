import { Router } from 'express'
import { protect } from '../middlewares/auth'
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getMyTrips,
} from '../controllers/trip.controller'

const router = Router()

router
  .route('/')
  .get(getTrips)
  .post(protect, createTrip)

router
  .route('/my')
  .get(protect, getMyTrips)

router
  .route('/:id')
  .get(getTripById)
  .patch(protect, updateTrip)
  .delete(protect, deleteTrip)

export default router
