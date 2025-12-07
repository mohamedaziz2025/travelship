import mongoose, { Document, Schema } from 'mongoose'

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId
  reportedUser?: mongoose.Types.ObjectId
  announcement?: mongoose.Types.ObjectId
  trip?: mongoose.Types.ObjectId
  reason: string
  description: string
  proofs: string[]
  status: 'pending' | 'reviewed' | 'closed' | 'rejected'
  actionTaken?: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  reviewNotes?: string
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<IReport>(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le rapporteur est requis'],
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    announcement: {
      type: Schema.Types.ObjectId,
      ref: 'Announcement',
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
    reason: {
      type: String,
      required: [true, 'Le motif est requis'],
      enum: [
        'spam',
        'inappropriate_content',
        'fraud',
        'scam',
        'fake_profile',
        'harassment',
        'violence',
        'illegal_items',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Une description est requise'],
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
    },
    proofs: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'closed', 'rejected'],
      default: 'pending',
    },
    actionTaken: {
      type: String,
      enum: ['none', 'warning', 'post_deleted', 'user_suspended', 'user_banned'],
      default: 'none',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères'],
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 })
reportSchema.index({ reportedUser: 1 })
reportSchema.index({ announcement: 1 })
reportSchema.index({ trip: 1 })

export const Report = mongoose.model<IReport>('Report', reportSchema)
