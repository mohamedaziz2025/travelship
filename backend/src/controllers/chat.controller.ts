import { Response, NextFunction } from 'express'
import { Conversation, Message } from '../models/Chat'
import { AppError } from '../middlewares/errorHandler'
import { AuthRequest } from '../middlewares/auth'

// @desc    Get user conversations
// @route   GET /api/v1/chat/conversations
export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user?._id,
    })
      .populate('participants', 'name email avatarUrl verified')
      .populate('announcementId')
      .populate('tripId')
      .sort({ lastMessageAt: -1 })

    res.json({
      success: true,
      data: { conversations },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get conversation messages
// @route   GET /api/v1/chat/conversations/:id/messages
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const conversation = await Conversation.findById(req.params.id)

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404))
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user?._id.toString()
    )

    if (!isParticipant) {
      return next(new AppError('Non autorisé', 403))
    }

    const messages = await Message.find({
      conversationId: req.params.id,
    })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: 1 })

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.id,
        senderId: { $ne: req.user?._id },
        read: false,
      },
      { read: true }
    )

    res.json({
      success: true,
      data: { messages },
    })
  } catch (error) {
    next(error)
  }
}
