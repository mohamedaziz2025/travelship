import mongoose, { Document, Schema } from 'mongoose'

export interface IStaticPage extends Document {
  key: string
  title: string
  content: string
  category: 'legal' | 'faq' | 'help'
  published: boolean
  lastEditedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const staticPageSchema = new Schema<IStaticPage>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['terms', 'privacy', 'shipping_terms', 'faq', 'about', 'help'],
    },
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
    },
    category: {
      type: String,
      enum: ['legal', 'faq', 'help'],
      required: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

staticPageSchema.index({ key: 1 })
staticPageSchema.index({ category: 1 })

export const StaticPage = mongoose.model<IStaticPage>('StaticPage', staticPageSchema)
