import express from 'express';
import {
  // Dashboard Stats (Module A)
  getDashboardStats,
  
  // User Management (Module B)
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUser,
  updateUserStatus,
  blockUser,
  unblockUser,
  deleteUser,
  
  // Announcement Management (Module C)
  getAllAnnouncements,
  getAnnouncementById,
  toggleFeaturedAnnouncement,
  approveAnnouncement,
  rejectAnnouncement,
  featureAnnouncement,
  deleteAnnouncement,
  
  // Report Management (Module D)
  getAllReports,
  getReportById,
  handleReport,
  closeReport,
  deleteReportedPost,
  
  // Advanced Statistics (Module E)
  getAdvancedStats,
  
  // System Settings (Module F)
  getSystemSettings,
  updateSystemSetting,
  getAdmins,
  updateAdminRole,
  
  // Static Pages (Module G)
  getStaticPages,
  getStaticPage,
  updateStaticPage,
  createStaticPage,
} from '../controllers/admin.controller.v2';
import { protect, authorize } from '../middlewares/auth';

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// ========================================
// 📊 MODULE A - DASHBOARD STATS
// ========================================
router.get('/stats/dashboard', getDashboardStats);

// ========================================
// 👥 MODULE B - USER MANAGEMENT
// ========================================
router.get('/users/list', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/profile', getUserProfile);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);
router.delete('/users/:id/delete', deleteUser);

// ========================================
// 📢 MODULE C - ANNOUNCEMENT MANAGEMENT
// ========================================
router.get('/posts/list', getAllAnnouncements);
router.get('/posts/:id', getAnnouncementById);
router.post('/posts/:id/feature', toggleFeaturedAnnouncement);
router.post('/posts/:id/approve', approveAnnouncement);
router.post('/posts/:id/reject', rejectAnnouncement);
router.delete('/posts/:id/delete', deleteAnnouncement);

// ========================================
// 🚨 MODULE D - REPORT MANAGEMENT
// ========================================
router.get('/reports/list', getAllReports);
router.get('/reports/:id', getReportById);
router.post('/reports/:id/handle', handleReport);
router.post('/reports/:id/close', closeReport);
router.post('/reports/:id/deletePost', deleteReportedPost);

// ========================================
// 📈 MODULE E - ADVANCED STATISTICS
// ========================================
router.get('/stats/advanced', getAdvancedStats);
router.get('/stats/general', getDashboardStats); // Alias
router.get('/stats/users', getAdvancedStats);
router.get('/stats/posts', getAdvancedStats);

// ========================================
// ⚙️ MODULE F - SYSTEM SETTINGS
// ========================================
router.get('/settings', getSystemSettings);
router.post('/settings', updateSystemSetting);
router.put('/settings', updateSystemSetting);

// Admin Management
router.get('/admins', getAdmins);
router.put('/admins/:id/role', updateAdminRole);

// ========================================
// 📄 MODULE G - STATIC PAGES
// ========================================
router.get('/pages', getStaticPages);
router.get('/pages/:key', getStaticPage);
router.put('/pages/:key', updateStaticPage);
router.post('/pages', createStaticPage);

export default router;
