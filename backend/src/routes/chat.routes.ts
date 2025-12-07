import { Router } from 'express'
import { protect } from '../middlewares/auth'
import {
  getConversations,
  getMessages,
} from '../controllers/chat.controller'

const router = Router()

router.use(protect)

// @route   GET /api/v1/chat/conversations
// @desc    Get user conversations
// @access  Private
router.get('/conversations', getConversations)

// @route   GET /api/v1/chat/conversations/:id/messages
// @desc    Get conversation messages
// @access  Private
router.get('/conversations/:id/messages', getMessages)

export default router
