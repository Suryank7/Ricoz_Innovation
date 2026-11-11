import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  entityType: 'brand' | 'investor';
  entityId: mongoose.Types.ObjectId;
  claim: string;
  category: 'financial' | 'legal_ip' | 'operations' | 'management' | 'compliance';
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedBy: mongoose.Types.ObjectId;
  confidentialityLevel: 'public' | 'internal_only' | 'deal_room_only' | 'strictly_confidential';
  verificationStatus: 'self_reported' | 'supported_by_evidence' | 'reviewed_by_adviser' | 'unresolved';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    entityType: { type: String, required: true, enum: ['brand', 'investor'] },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    claim: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['financial', 'legal_ip', 'operations', 'management', 'compliance'],
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    confidentialityLevel: {
      type: String,
      required: true,
      enum: ['public', 'internal_only', 'deal_room_only', 'strictly_confidential'],
      default: 'internal_only',
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ['self_reported', 'supported_by_evidence', 'reviewed_by_adviser', 'unresolved'],
      default: 'self_reported',
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

EvidenceSchema.index({ entityType: 1, entityId: 1 });
EvidenceSchema.index({ verificationStatus: 1 });

export const Evidence = mongoose.model<IEvidence>('Evidence', EvidenceSchema);
