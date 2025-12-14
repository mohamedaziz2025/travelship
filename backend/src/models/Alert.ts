import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'sender' | 'shipper'; // sender cherche un shipper, shipper cherche un sender
  fromCity?: string;
  fromCountry?: string;
  toCity?: string;
  toCountry?: string;
  dateFrom?: Date;
  dateTo?: Date;
  maxWeight?: number;
  minWeight?: number;
  maxReward?: number;
  minReward?: number;
  isActive: boolean;
  notificationMethod: 'email' | 'push' | 'both';
  createdAt: Date;
  updatedAt: Date;
  lastNotifiedAt?: Date;
  matchCount: number;
}

const AlertSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['sender', 'shipper'],
      required: true,
    },
    fromCity: {
      type: String,
      trim: true,
    },
    fromCountry: {
      type: String,
      trim: true,
    },
    toCity: {
      type: String,
      trim: true,
    },
    toCountry: {
      type: String,
      trim: true,
    },
    dateFrom: {
      type: Date,
    },
    dateTo: {
      type: Date,
    },
    maxWeight: {
      type: Number,
    },
    minWeight: {
      type: Number,
    },
    maxReward: {
      type: Number,
    },
    minReward: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notificationMethod: {
      type: String,
      enum: ['email', 'push', 'both'],
      default: 'both',
    },
    lastNotifiedAt: {
      type: Date,
    },
    matchCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
AlertSchema.index({ userId: 1, isActive: 1 });
AlertSchema.index({ type: 1, isActive: 1 });
AlertSchema.index({ fromCity: 1, toCity: 1 });

export default mongoose.model<IAlert>('Alert', AlertSchema);
