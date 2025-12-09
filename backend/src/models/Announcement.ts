import mongoose, { Document, Schema } from 'mongoose'

export interface IAnnouncement extends Document {
  userId: mongoose.Types.ObjectId
  userType: 'shipper' | 'sender' // Type d'utilisateur
  type: 'package' | 'shopping' // Type de colis (obsolète, remplacé par packageType)
  packageType?: 'personal' | 'purchase' | 'both' // Type de colis accepté/envoyé
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
  transportType?: 'plane' | 'boat' | 'train' | 'car' // Moyen de transport (pour shipper)
  weightRange: '0-1' | '2-5' | '5-10' | '10-15' | '15-20' | '20-25' | '25-30' | '30+' // Plage de poids en kg
  serviceType?: 'paid' | 'free' // Service rémunéré ou gratuit (pour shipper)
  reward: number
  currency: string
  description: string
  photos: string[]
  weight?: number // Poids exact (obsolète, utiliser weightRange)
  dimensions?: {
    length: number
    width: number
    height: number
  }
  phoneNumber?: string // Numéro de téléphone optionnel
  isUrgent?: boolean // Annonce urgente (pour sender)
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
    userType: {
      type: String,
      enum: ['shipper', 'sender'],
      required: true,
    },
    type: {
      type: String,
      enum: ['package', 'shopping'],
      required: true,
    },
    packageType: {
      type: String,
      enum: ['personal', 'purchase', 'both'],
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
    transportType: {
      type: String,
      enum: ['plane', 'boat', 'train', 'car'],
    },
    weightRange: {
      type: String,
      enum: ['0-1', '2-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30+'],
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['paid', 'free'],
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
    phoneNumber: {
      type: String,
      trim: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
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
