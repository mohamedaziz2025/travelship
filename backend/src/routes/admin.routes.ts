import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllAnnouncements,
  deleteAnnouncement,
  getAllTrips,
  deleteTrip,
  getAllConversations,
  deleteConversation,
} from '../controllers/admin.controller';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Announcement management
router.get('/announcements', getAllAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);

// Trip management
router.get('/trips', getAllTrips);
router.delete('/trips/:id', deleteTrip);

// Conversation management
router.get('/conversations', getAllConversations);
router.delete('/conversations/:id', deleteConversation);

export default router;
