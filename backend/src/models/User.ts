import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'sender' | 'shipper' | 'both' | 'admin'
  adminRole?: 'superadmin' | 'moderator'
  status: 'active' | 'blocked' | 'suspended'
  country?: string
  city?: string
  phone?: string
  verified: boolean
  avatarUrl?: string
  badges: string[]
  stats: {
    matches: number
    rating: number
    completed: number
    totalReviews: number
  }
  refreshTokens: string[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false,
    },
    role: {
      type: String,
      enum: ['sender', 'shipper', 'both', 'admin'],
      default: 'both',
    },
    adminRole: {
      type: String,
      enum: ['superadmin', 'moderator'],
      required: false,
      default: function(this: IUser) { 
        return this.role === 'admin' ? 'moderator' : undefined 
      },
    },
    status: {
      type: String,
      enum: ['active', 'blocked', 'suspended'],
      default: 'active',
    },
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
    },
    badges: {
      type: [String],
      default: [],
    },
    stats: {
      matches: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      completed: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
