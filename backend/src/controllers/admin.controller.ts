import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Announcement } from '../models/Announcement';
import { Trip } from '../models/Trip';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { AppError } from '../middlewares/errorHandler';

// Get dashboard statistics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalAnnouncements,
      totalTrips,
      totalConversations,
      totalMessages,
      verifiedUsers,
      activeUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Announcement.countDocuments(),
      Trip.countDocuments(),
      Conversation.countDocuments(),
      Message.countDocuments(),
      User.countDocuments({ verified: true }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          active: activeUsers,
        },
        announcements: totalAnnouncements,
        trips: totalTrips,
        conversations: totalConversations,
        messages: totalMessages,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users with pagination
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const role = req.query.role as string;
    const verified = req.query.verified as string;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') filter.role = role;
    if (verified !== undefined) filter.verified = verified === 'true';

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

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, verified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (verified !== undefined) user.verified = verified;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'Utilisateur mis à jour avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user?.id) {
      throw new AppError('Vous ne pouvez pas supprimer votre propre compte', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Delete user's data
    await Promise.all([
      Announcement.deleteMany({ userId: id }),
      Trip.deleteMany({ userId: id }),
      Message.deleteMany({ senderId: id }),
    ]);

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all announcements with pagination
export const getAllAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const status = req.query.status as string;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'all') filter.status = status;

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('userId', 'name email avatarUrl')
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

// Delete announcement
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new AppError('Annonce non trouvée', 404);
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all trips with pagination
export const getAllTrips = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const status = req.query.status as string;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } },
      ];
    }
    if (status && status !== 'all') filter.status = status;

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .populate('userId', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Trip.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: trips,
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

// Delete trip
export const deleteTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      throw new AppError('Voyage non trouvé', 404);
    }

    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Voyage supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all conversations
export const getAllConversations = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    console.log('Admin - Fetching all conversations...');
    
    const [conversations, total] = await Promise.all([
      Conversation.find()
        .populate('participants', 'name email avatarUrl verified stats')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(),
    ]);

    console.log(`Admin - Found ${conversations.length} conversations out of ${total} total`);

    res.status(200).json({
      success: true,
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin - Error fetching conversations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new AppError('Conversation non trouvée', 404);
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId: id });
    await conversation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Conversation supprimée avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages from a specific conversation
export const getConversationMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email avatarUrl');
    
    if (!conversation) {
      throw new AppError('Conversation non trouvée', 404);
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: id })
        .populate('sender', 'name email avatarUrl')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversationId: id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages,
      },
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

// Delete a specific message
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      throw new AppError('Message non trouvé', 404);
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Block/Unblock a conversation
export const toggleConversationBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new AppError('Conversation non trouvée', 404);
    }

    // Add blocked field to conversation if it doesn't exist
    (conversation as any).blocked = blocked;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: blocked ? 'Conversation bloquée' : 'Conversation débloquée',
      data: conversation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
