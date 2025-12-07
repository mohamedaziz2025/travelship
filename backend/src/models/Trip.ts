import mongoose, { Document, Schema } from 'mongoose'

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId
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
  availableKg: number
  notes?: string
  moderationStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  status: 'active' | 'completed' | 'cancelled'
  views: number
  reportCount: number
  createdAt: Date
  updatedAt: Date
}

const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    availableKg: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
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
      enum: ['active', 'completed', 'cancelled'],
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
tripSchema.index({ 'from.city': 1, 'to.city': 1 })
tripSchema.index({ dateFrom: 1, dateTo: 1 })
tripSchema.index({ status: 1 })
tripSchema.index({ userId: 1 })

export const Trip = mongoose.model<ITrip>('Trip', tripSchema)
