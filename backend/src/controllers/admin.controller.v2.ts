import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Announcement } from '../models/Announcement';
import { Trip } from '../models/Trip';
import { Report } from '../models/Report';
import { SystemSettings } from '../models/SystemSettings';
import { StaticPage } from '../models/StaticPage';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';

// ========================================
// 📊 DASHBOARD STATISTICS (Module A)
// ========================================

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      totalUsers,
      senders,
      shippers,
      totalAnnouncements,
      activeAnnouncements,
      pendingAnnouncements,
      reportedAnnouncements,
      totalReports,
      topCities,
      userGrowth,
      announcementGrowth,
    ] = await Promise.all([
      // Nombre total d'utilisateurs
      User.countDocuments({ role: { $ne: 'admin' } }),
      
      // Senders
      User.countDocuments({ role: { $in: ['sender', 'both'] } }),
      
      // Shippers
      User.countDocuments({ role: { $in: ['shipper', 'both'] } }),
      
      // Nombre total d'annonces
      Announcement.countDocuments(),
      
      // Annonces actives
      Announcement.countDocuments({ status: 'active', moderationStatus: 'approved' }),
      
      // Annonces en attente
      Announcement.countDocuments({ moderationStatus: 'pending' }),
      
      // Annonces signalées
      Announcement.countDocuments({ reportCount: { $gt: 0 } }),
      
      // Nombre de signalements
      Report.countDocuments({ status: 'pending' }),
      
      // Top 5 villes populaires
      Announcement.aggregate([
        { $group: { _id: '$from.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      
      // Courbe utilisateurs sur 30 jours
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      
      // Courbe annonces sur 30 jours
      Announcement.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          senders,
          shippers,
        },
        announcements: {
          total: totalAnnouncements,
          active: activeAnnouncements,
          pending: pendingAnnouncements,
          reported: reportedAnnouncements,
        },
        reports: {
          pending: totalReports,
        },
        topCities: topCities.map((c) => ({ city: c._id, count: c.count })),
        growth: {
          users: userGrowth.map((g) => ({ date: g._id, count: g.count })),
          announcements: announcementGrowth.map((g) => ({ date: g._id, count: g.count })),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// 👥 USER MANAGEMENT (Module B)
// ========================================

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const country = req.query.country as string;

    const filter: any = { role: { $ne: 'admin' } };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;
    if (country) filter.country = country;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [user, announcements, trips, reports] = await Promise.all([
      User.findById(id).select('-password -refreshTokens'),
      Announcement.find({ userId: id }).sort({ createdAt: -1 }).limit(10),
      Trip.find({ userId: id }).sort({ createdAt: -1 }).limit(10),
      Report.find({ reportedUser: id }).populate('reportedBy', 'name email'),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        announcements,
        trips,
        reports,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ne pas permettre la modification du mot de passe via cette route
    delete updates.password;
    delete updates.refreshTokens;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'blocked' },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur bloqué avec succès',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unblockUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur débloqué avec succès',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Delete user's data
    await Promise.all([
      User.findByIdAndDelete(id),
      Announcement.deleteMany({ userId: id }),
      Trip.deleteMany({ userId: id }),
      Conversation.deleteMany({ $or: [{ user1: id }, { user2: id }] }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Utilisateur et ses données supprimés avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// 📢 ANNOUNCEMENT MANAGEMENT (Module C)
// ========================================

export const getAllAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const type = req.query.type as string;
    const moderationStatus = req.query.moderationStatus as string;
    const status = req.query.status as string;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (type && type !== 'all') filter.type = type;
    if (moderationStatus && moderationStatus !== 'all') filter.moderationStatus = moderationStatus;
    if (status && status !== 'all') filter.status = status;

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('userId', 'name email country')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Announcement.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnnouncementById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id).populate('userId', 'name email');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    // Transformer pour que le frontend puisse utiliser 'user'
    const announcementObj = announcement.toObject();
    const result = {
      ...announcementObj,
      user: announcementObj.userId,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { moderationStatus: 'approved', rejectionReason: undefined },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    res.status(200).json({
      success: true,
      message: 'Annonce approuvée avec succès',
      data: announcement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { moderationStatus: 'rejected', rejectionReason: reason },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    res.status(200).json({
      success: true,
      message: 'Annonce rejetée avec succès',
      data: announcement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFeaturedAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    announcement.featured = !announcement.featured;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: announcement.featured ? 'Annonce mise en avant' : 'Annonce retirée de la mise en avant',
      data: announcement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const featureAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { featured },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }

    res.status(200).json({
      success: true,
      message: featured ? 'Annonce mise en avant' : 'Annonce retirée de la mise en avant',
      data: announcement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Announcement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// 🚨 REPORT MANAGEMENT (Module D)
// ========================================

export const getAllReports = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const status = req.query.status as string;
    const reason = req.query.reason as string;

    const filter: any = {};
    
    if (status && status !== 'all') filter.status = status;
    if (reason && reason !== 'all') filter.reason = reason;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reportedBy', 'name email')
        .populate('reportedUser', 'name email')
        .populate('announcement', 'title type')
        .populate('trip', 'from to')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email')
      .populate('announcement', 'title type')
      .populate('trip', 'from to')
      .populate('reviewedBy', 'name');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Signalement non trouvé' });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Signalement non trouvé' });
    }

    let actionTaken = '';

    switch (action) {
      case 'close':
        report.status = 'closed';
        actionTaken = 'Signalement classé sans suite';
        break;
      case 'deletePost':
        if (report.announcement) {
          await Announcement.findByIdAndDelete(report.announcement);
          actionTaken = 'Annonce supprimée';
        }
        report.status = 'closed';
        break;
      case 'banUser':
        if (report.reportedUser) {
          await User.findByIdAndUpdate(report.reportedUser, { status: 'blocked' });
          actionTaken = 'Utilisateur banni';
        }
        report.status = 'closed';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Action invalide' });
    }

    report.actionTaken = actionTaken;
    report.reviewedBy = req.user?.id;
    report.reviewedAt = new Date();
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Action effectuée avec succès',
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes, actionTaken } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status: 'closed',
        reviewedBy: req.user?.id,
        reviewNotes,
        actionTaken: actionTaken || 'none',
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Signalement non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Signalement fermé avec succès',
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReportedPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Signalement non trouvé' });
    }

    // Delete the reported post
    if (report.announcement) {
      await Announcement.findByIdAndDelete(report.announcement);
    } else if (report.trip) {
      await Trip.findByIdAndDelete(report.trip);
    }

    // Close the report
    await Report.findByIdAndUpdate(id, {
      status: 'closed',
      reviewedBy: req.user?.id,
      actionTaken: 'post_deleted',
    });

    res.status(200).json({
      success: true,
      message: 'Publication supprimée et signalement fermé',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// 📈 ADVANCED STATISTICS (Module E)
// ========================================

export const getAdvancedStats = async (req: AuthRequest, res: Response) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      announcementGrowth,
      topCountries,
      topDestinations,
      typeDistribution,
    ] = await Promise.all([
      // Croissance utilisateurs (6 mois)
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Croissance annonces (6 mois)
      Announcement.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top pays
      Announcement.aggregate([
        { $group: { _id: '$from.country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Top destinations
      Announcement.aggregate([
        {
          $group: {
            _id: { from: '$from.city', to: '$to.city' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Distribution par type
      Announcement.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth: userGrowth.map((g) => ({ month: g._id, count: g.count })),
        announcementGrowth: announcementGrowth.map((g) => ({ month: g._id, count: g.count })),
        topCountries: topCountries.map((c) => ({ country: c._id, count: c.count })),
        topDestinations: topDestinations.map((d) => ({
          from: d._id.from,
          to: d._id.to,
          count: d.count,
        })),
        typeDistribution: typeDistribution.map((t) => ({ type: t._id, count: t.count })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// ⚙️ SYSTEM SETTINGS (Module F)
// ========================================

export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string;
    const filter: any = {};
    
    if (category && category !== 'all') filter.category = category;

    const settings = await SystemSettings.find(filter).sort({ category: 1, key: 1 });

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSystemSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { key, value, category, description } = req.body;

    const setting = await SystemSettings.findOneAndUpdate(
      { key },
      { value, category, description, updatedBy: req.user?.id },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Paramètre mis à jour avec succès',
      data: setting,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdmins = async (req: AuthRequest, res: Response) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminRole } = req.body;

    // Check if requesting user is superadmin
    if (req.user?.adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Seul un super admin peut modifier les rôles',
      });
    }

    const admin = await User.findByIdAndUpdate(
      id,
      { adminRole },
      { new: true }
    ).select('-password -refreshTokens');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Rôle admin mis à jour avec succès',
      data: admin,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, adminRole } = req.body;

    // Check if requesting user is superadmin
    if (req.user?.adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Seul un super admin peut modifier les admins',
      });
    }

    // Prevent modifying yourself
    if (id === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre compte ici',
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (adminRole) updateData.adminRole = adminRole;

    const admin = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Admin mis à jour avec succès',
      data: admin,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const blockAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    // Check if requesting user is superadmin
    if (req.user?.adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Seul un super admin peut bloquer/débloquer des admins',
      });
    }

    // Prevent blocking yourself
    if (id === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous bloquer vous-même',
      });
    }

    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Admin non trouvé' });
    }

    admin.status = blocked ? 'blocked' : 'active';
    await admin.save();

    res.status(200).json({
      success: true,
      message: blocked ? 'Admin bloqué avec succès' : 'Admin débloqué avec succès',
      data: admin,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if requesting user is superadmin
    if (req.user?.adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Seul un super admin peut supprimer des admins',
      });
    }

    // Prevent deleting yourself
    if (id === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte',
      });
    }

    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Admin non trouvé' });
    }

    // Check if it's the last superadmin
    if (admin.adminRole === 'superadmin') {
      const superadminCount = await User.countDocuments({ 
        role: 'admin', 
        adminRole: 'superadmin' 
      });
      
      if (superadminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier super admin',
        });
      }
    }

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admin supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// 📄 STATIC PAGES (Module G)
// ========================================

export const getStaticPages = async (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string;
    const filter: any = {};
    
    if (category && category !== 'all') filter.category = category;

    const pages = await StaticPage.find(filter)
      .populate('lastEditedBy', 'name email')
      .sort({ category: 1, key: 1 });

    res.status(200).json({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaticPage = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;

    const page = await StaticPage.findOne({ key }).populate('lastEditedBy', 'name email');

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page non trouvée' });
    }

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaticPage = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { title, content, published } = req.body;

    const page = await StaticPage.findOneAndUpdate(
      { key },
      { title, content, published, lastEditedBy: req.user?.id },
      { new: true }
    );

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page non trouvée' });
    }

    res.status(200).json({
      success: true,
      message: 'Page mise à jour avec succès',
      data: page,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaticPage = async (req: AuthRequest, res: Response) => {
  try {
    const { key, title, content, category, published } = req.body;

    const page = await StaticPage.create({
      key,
      title,
      content,
      category,
      published,
      lastEditedBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: 'Page créée avec succès',
      data: page,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Une page avec cette clé existe déjà',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// 💬 CONVERSATION MANAGEMENT (Module H)
// ========================================

export const getAllConversations = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search, blocked } = req.query;

    const query: any = {};

    // Filter by blocked status
    if (blocked !== undefined) {
      query.blocked = blocked === 'true';
    }

    // Search by participant name or email
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = users.map((u) => u._id);
      query.participants = { $in: userIds };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate('participants', 'name email avatarUrl verified')
        .populate('blockedBy', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Conversation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: conversations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email avatarUrl verified stats')
      .populate('blockedBy', 'name email');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation non trouvée' });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversationMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation non trouvée' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: id })
        .populate('senderId', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments({ conversationId: id }),
    ]);

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation non trouvée' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId: id });

    // Delete the conversation
    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Conversation et tous ses messages supprimés avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleConversationBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation non trouvée' });
    }

    conversation.blocked = blocked;
    conversation.blockedBy = blocked ? req.user?.id : undefined;
    conversation.blockedAt = blocked ? new Date() : undefined;

    await conversation.save();

    res.status(200).json({
      success: true,
      message: blocked ? 'Conversation bloquée avec succès' : 'Conversation débloquée avec succès',
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message non trouvé' });
    }

    await message.deleteOne();

    // Update lastMessage in conversation if this was the last message
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation && conversation.lastMessage) {
      const latestMessage = await Message.findOne({ conversationId: message.conversationId })
        .sort({ createdAt: -1 });

      if (latestMessage) {
        conversation.lastMessage = {
          content: latestMessage.content,
          senderId: latestMessage.senderId,
          timestamp: latestMessage.createdAt,
        };
      } else {
        conversation.lastMessage = undefined;
      }

      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
