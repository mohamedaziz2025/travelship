import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Le contenu du message est requis'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour rechercher les messages d'une conversation
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Delete existing model to avoid OverwriteModelError
if (mongoose.models.Message) {
  delete mongoose.models.Message;
}

export default mongoose.model<IMessage>('Message', messageSchema);
