import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  archivedBy: mongoose.Types.ObjectId[];
  deletedBy: mongoose.Types.ObjectId[];
  blocked?: boolean;
  blockedBy?: mongoose.Types.ObjectId;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: {
        content: { type: String },
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date },
      },
      required: false,
      _id: false,
    },
    archivedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    blockedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour rechercher les conversations d'un utilisateur
conversationSchema.index({ participants: 1 });

// Méthode pour vérifier si un utilisateur fait partie de la conversation
conversationSchema.methods.hasParticipant = function (userId: string) {
  return this.participants.some((p: any) => p.toString() === userId);
};

// Delete existing model to avoid OverwriteModelError
if (mongoose.models.Conversation) {
  delete mongoose.models.Conversation;
}

export default mongoose.model<IConversation>('Conversation', conversationSchema);
