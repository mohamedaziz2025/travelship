import mongoose, { Document, Schema } from 'mongoose'

export interface ISystemSettings extends Document {
  key: string
  value: any
  category: 'general' | 'moderation' | 'matching' | 'legal' | 'forbidden_items'
  description?: string
  updatedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'moderation', 'matching', 'legal', 'forbidden_items'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

systemSettingsSchema.index({ category: 1 })
systemSettingsSchema.index({ key: 1 })

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema)
