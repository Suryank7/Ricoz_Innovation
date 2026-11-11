import mongoose, { Schema, Document } from 'mongoose';
import { GATE_TYPES } from '../config/constants';

export interface IReadinessGate extends Document {
  brandId: mongoose.Types.ObjectId;
  gateType: typeof GATE_TYPES[number];
  status: 'pending' | 'approved' | 'rejected';
  approverId?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  comments?: string;
  blockingReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReadinessGateSchema = new Schema<IReadinessGate>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    gateType: {
      type: String,
      required: true,
      enum: GATE_TYPES,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approverId: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    comments: { type: String, trim: true },
    blockingReasons: [{ type: String }],
  },
  { timestamps: true }
);

ReadinessGateSchema.index({ brandId: 1, gateType: 1 }, { unique: true });

export const ReadinessGate = mongoose.model<IReadinessGate>('ReadinessGate', ReadinessGateSchema);
