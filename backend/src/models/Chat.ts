import mongoose, { Document, Schema } from 'mongoose'

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]
  announcementId?: mongoose.Types.ObjectId
  tripId?: mongoose.Types.ObjectId
  lastMessage?: string
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator: function (v: mongoose.Types.ObjectId[]) {
          return v.length === 2
        },
        message: 'Une conversation doit avoir exactement 2 participants',
      },
    },
    announcementId: {
      type: Schema.Types.ObjectId,
      ref: 'Announcement',
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
    lastMessage: String,
    lastMessageAt: Date,
  },
  {
    timestamps: true,
  }
)

conversationSchema.index({ participants: 1 })

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  content: string
  attachments: string[]
  read: boolean
  createdAt: Date
  updatedAt: Date
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
      required: true,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

messageSchema.index({ conversationId: 1, createdAt: -1 })

export const Message = mongoose.model<IMessage>('Message', messageSchema)
