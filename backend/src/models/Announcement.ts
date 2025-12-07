import mongoose, { Document, Schema } from 'mongoose'

export interface IAnnouncement extends Document {
  userId: mongoose.Types.ObjectId
  type: 'package' | 'shopping'
  title?: string
  from: {
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  to: {
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  dateFrom: Date
  dateTo: Date
  reward: number
  currency: string
  description: string
  photos: string[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  premium: boolean
  featured: boolean
  moderationStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  status: 'active' | 'matched' | 'completed' | 'cancelled'
  views: number
  reportCount: number
  createdAt: Date
  updatedAt: Date
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['package', 'shopping'],
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    from: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    to: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    dateFrom: {
      type: Date,
      required: true,
    },
    dateTo: {
      type: Date,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    photos: {
      type: [String],
      default: [],
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'matched', 'completed', 'cancelled'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index for search performance
announcementSchema.index({ 'from.city': 1, 'to.city': 1 })
announcementSchema.index({ dateFrom: 1, dateTo: 1 })
announcementSchema.index({ status: 1 })
announcementSchema.index({ userId: 1 })

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema)
