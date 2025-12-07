import { Router } from 'express'
import { protect } from '../middlewares/auth'
import { getMe, updateMe, getUserById } from '../controllers/user.controller'

const router = Router()

// @route   GET /api/v1/users/:id
// @desc    Get user public profile
// @access  Public
router.get('/:id', getUserById)

// All routes below are protected
router.use(protect)

// @route   GET /api/v1/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', getMe)

// @route   PATCH /api/v1/users/me
// @desc    Update current user profile
// @access  Private
router.patch('/me', updateMe)

export default router
