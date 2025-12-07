import { Router } from 'express'
import { protect } from '../middlewares/auth'
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
} from '../controllers/announcement.controller'

const router = Router()

router
  .route('/')
  .get(getAnnouncements)
  .post(protect, createAnnouncement)

router
  .route('/my')
  .get(protect, getMyAnnouncements)

router
  .route('/:id')
  .get(getAnnouncementById)
  .patch(protect, updateAnnouncement)
  .delete(protect, deleteAnnouncement)

export default router
