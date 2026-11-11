import mongoose, { Schema, Document } from 'mongoose';

export interface ISOPVersion {
  version: string;
  contentMarkdown: string;
  summary: string;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  approvalNotes?: string;
}

export interface ISOP extends Document {
  brandId: mongoose.Types.ObjectId;
  code: string;
  title: string;
  category: string;
  outletFormat: string[];
  ownerId: mongoose.Types.ObjectId;
  currentVersion: string;
  status: 'draft' | 'in_review' | 'approved' | 'superseded';
  contentMarkdown: string;
  fileAttachmentUrl?: string;
  effectiveDate?: Date;
  nextReviewDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  reviewNotes?: string;
  versionHistory: ISOPVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const SOPVersionSchema = new Schema<ISOPVersion>(
  {
    version: { type: String, required: true },
    contentMarkdown: { type: String, required: true },
    summary: { type: String, default: 'Version updated' },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    approvalNotes: { type: String },
  },
  { _id: false }
);

const SOPSchema = new Schema<ISOP>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    code: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Opening & Closing',
        'Food Safety & Hygiene',
        'Inventory & Procurement',
        'Customer Service',
        'Staff Training',
        'Quality Control',
        'Equipment Maintenance',
        'Billing & POS',
      ],
    },
    outletFormat: [{ type: String }],
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentVersion: { type: String, default: '1.0.0' },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'in_review', 'approved', 'superseded'],
      default: 'draft',
    },
    contentMarkdown: { type: String, required: true },
    fileAttachmentUrl: { type: String },
    effectiveDate: { type: Date },
    nextReviewDate: { type: Date, index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    reviewNotes: { type: String },
    versionHistory: [SOPVersionSchema],
  },
  { timestamps: true }
);

SOPSchema.index({ brandId: 1, status: 1 });
SOPSchema.index({ brandId: 1, code: 1 });

export const SOP = mongoose.model<ISOP>('SOP', SOPSchema);
