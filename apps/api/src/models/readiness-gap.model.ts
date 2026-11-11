import mongoose, { Schema, Document } from 'mongoose';

export interface IReadinessGap extends Document {
  brandId: mongoose.Types.ObjectId;
  dimension: 'operating_repeatability' | 'unit_economics' | 'brand_ip' | 'management_capacity' | 'legal_preparation';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: mongoose.Types.ObjectId;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'closed';
  closureNotes?: string;
  closedBy?: mongoose.Types.ObjectId;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReadinessGapSchema = new Schema<IReadinessGap>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    dimension: {
      type: String,
      required: true,
      enum: ['operating_repeatability', 'unit_economics', 'brand_ip', 'management_capacity', 'legal_preparation'],
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    severity: {
      type: String,
      required: true,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'high',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ['open', 'in_progress', 'closed'],
      default: 'open',
    },
    closureNotes: { type: String, trim: true },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

ReadinessGapSchema.index({ brandId: 1, status: 1 });

export const ReadinessGap = mongoose.model<IReadinessGap>('ReadinessGap', ReadinessGapSchema);
