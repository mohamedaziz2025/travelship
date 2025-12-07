import { Router } from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  archiveConversation,
  unarchiveConversation,
  deleteConversation,
} from '../controllers/conversation.controller';
import { protect } from '../middlewares/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les conversations
router.route('/').get(getConversations).post(createConversation);

router.route('/:id').get(getConversation).delete(deleteConversation);

// Routes pour les messages d'une conversation
router.route('/:id/messages').get(getMessages).post(sendMessage);

router.route('/:id/read').patch(markAsRead);

router.route('/:id/archive').patch(archiveConversation);

router.route('/:id/unarchive').patch(unarchiveConversation);

export default router;
