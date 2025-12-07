import { Response, NextFunction } from 'express';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// Récupérer toutes les conversations de l'utilisateur
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    const conversations = await Conversation.find({
      participants: userId,
      deletedBy: { $ne: userId }, // Exclure les conversations supprimées par l'utilisateur
    })
      .populate('participants', 'name email avatarUrl verified stats')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer une conversation spécifique
export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const conversation = await Conversation.findById(id).populate(
      'participants',
      'name email avatarUrl verified stats'
    );

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participants.some((p: any) => p._id.toString() === userId?.toString())) {
      return next(new AppError('Accès non autorisé à cette conversation', 403));
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// Créer une nouvelle conversation
export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { participantId } = req.body;

    if (!participantId) {
      return next(new AppError('L\'ID du participant est requis', 400));
    }

    if (userId?.toString() === participantId) {
      return next(new AppError('Vous ne pouvez pas créer une conversation avec vous-même', 400));
    }

    // Vérifier si une conversation existe déjà entre ces deux utilisateurs
    // qui n'a pas été supprimée par les deux participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
      $or: [
        { deletedBy: { $exists: false } },
        { deletedBy: { $size: 0 } },
        { deletedBy: { $nin: [userId, participantId] } },
      ],
    }).populate('participants', 'name email avatarUrl verified stats');

    if (existingConversation) {
      // Si l'utilisateur actuel avait supprimé cette conversation, on la restaure
      if (existingConversation.deletedBy?.includes(userId as any)) {
        existingConversation.deletedBy = existingConversation.deletedBy.filter(
          (id: any) => id.toString() !== userId?.toString()
        );
        await existingConversation.save();
      }
      
      return res.status(200).json({
        success: true,
        data: existingConversation,
        message: 'Conversation existante',
      });
    }

    // Créer une nouvelle conversation
    const conversation = await Conversation.create({
      participants: [userId, participantId],
    });

    const populatedConversation = await Conversation.findById(conversation._id).populate(
      'participants',
      'name email avatarUrl verified stats'
    );

    res.status(201).json({
      success: true,
      data: populatedConversation,
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer les messages d'une conversation
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { limit = 50, before } = req.query;

    // Vérifier que la conversation existe et que l'utilisateur en fait partie
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }

    if (!conversation.participants.some((p: any) => p.toString() === userId?.toString())) {
      return next(new AppError('Accès non autorisé à cette conversation', 403));
    }

    // Construire la query
    const query: any = { conversationId: id };
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    // Récupérer les messages
    const messages = await Message.find(query)
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Inverser pour avoir l'ordre chronologique
    });
  } catch (error) {
    next(error);
  }
};

// Envoyer un message
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // ID de la conversation
    const userId = req.user?._id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return next(new AppError('Le contenu du message est requis', 400));
    }

    // Vérifier que la conversation existe et que l'utilisateur en fait partie
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }

    if (!conversation.participants.some((p: any) => p.toString() === userId?.toString())) {
      return next(new AppError('Accès non autorisé à cette conversation', 403));
    }

    // Créer le message
    const message = await Message.create({
      conversationId: id,
      senderId: userId,
      content: content.trim(),
    });

    // Mettre à jour le dernier message de la conversation
    conversation.lastMessage = {
      content: content.trim(),
      senderId: userId!,
      timestamp: new Date(),
    };
    await conversation.save();

    // Peupler les données du message
    const populatedMessage = await Message.findById(message._id).populate(
      'senderId',
      'name avatarUrl'
    );

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Marquer les messages comme lus
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // ID de la conversation
    const userId = req.user?._id;

    // Vérifier que la conversation existe et que l'utilisateur en fait partie
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }

    if (!conversation.participants.some((p: any) => p.toString() === userId?.toString())) {
      return next(new AppError('Accès non autorisé à cette conversation', 403));
    }

    // Marquer tous les messages de la conversation comme lus (sauf ceux envoyés par l'utilisateur)
    await Message.updateMany(
      {
        conversationId: id,
        senderId: { $ne: userId },
        read: false,
      },
      {
        read: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marqués comme lus',
    });
  } catch (error) {
    next(error);
  }
};

// Archiver une conversation
export const archiveConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }

    if (!conversation.participants.some((p: any) => p.toString() === userId?.toString())) {
      return next(new AppError('Accès non autorisé à cette conversation', 403));
    }

    // Ajouter l'utilisateur à la liste archivedBy s'il n'y est pas déjà
    if (!conversation.archivedBy.some((id: any) => id.toString() === userId?.toString())) {
      conversation.archivedBy.push(userId!);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Conversation archivée',
    });
  } catch (error) {
    next(error);
  }
};

// Désarchiver une conversation
export const unarchiveConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }

    if (!conversation.participants.some((p: any) => p.toString() === userId?.toString())) {
      return next(new AppError('Accès non autorisé à cette conversation', 403));
    }

    // Retirer l'utilisateur de la liste archivedBy
    conversation.archivedBy = conversation.archivedBy.filter(
      (id: any) => id.toString() !== userId?.toString()
    );
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation désarchivée',
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer une conversation (soft delete)
export const deleteConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }

    if (!conversation.participants.some((p: any) => p.toString() === userId?.toString())) {
      return next(new AppError('Accès non autorisé à cette conversation', 403));
    }

    // Ajouter l'utilisateur à la liste deletedBy
    if (!conversation.deletedBy.some((id: any) => id.toString() === userId?.toString())) {
      conversation.deletedBy.push(userId!);
      await conversation.save();
    }

    // Si tous les participants ont supprimé la conversation, la supprimer définitivement
    if (conversation.deletedBy.length === conversation.participants.length) {
      await Message.deleteMany({ conversationId: id });
      await Conversation.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: 'Conversation supprimée',
    });
  } catch (error) {
    next(error);
  }
};
