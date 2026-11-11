import mongoose, { Schema, Document } from 'mongoose';
import { JURISDICTIONS } from '../config/constants';

export interface IChecklistItem {
  itemKey: string;
  title: string;
  isMandatory: boolean;
  isCompleted: boolean;
  documentUrl?: string;
  notes?: string;
}

export interface ILegalDocumentVersion {
  title: string;
  version: string;
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  status: 'draft' | 'under_counsel_review' | 'counsel_cleared' | 'changes_required';
  reviewerNotes?: string;
}

export interface ILegalMatter extends Document {
  brandId: mongoose.Types.ObjectId;
  jurisdiction: typeof JURISDICTIONS[number];
  matterType: string;
  assignedCounselId?: mongoose.Types.ObjectId;
  status: 'not_started' | 'in_preparation' | 'awaiting_counsel' | 'changes_requested' | 'counsel_review_recorded';
  checklist: IChecklistItem[];
  documents: ILegalDocumentVersion[];
  counselReviewScope?: string;
  counselSignoffDate?: Date;
  counselNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    itemKey: { type: String, required: true },
    title: { type: String, required: true },
    isMandatory: { type: Boolean, default: true },
    isCompleted: { type: Boolean, default: false },
    documentUrl: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const LegalDocumentVersionSchema = new Schema<ILegalDocumentVersion>(
  {
    title: { type: String, required: true },
    version: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['draft', 'under_counsel_review', 'counsel_cleared', 'changes_required'],
      default: 'draft',
    },
    reviewerNotes: { type: String },
  },
  { _id: false }
);

const LegalMatterSchema = new Schema<ILegalMatter>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    jurisdiction: {
      type: String,
      required: true,
      enum: JURISDICTIONS,
      default: 'India',
    },
    matterType: {
      type: String,
      required: true,
      enum: [
        'Franchise Agreement',
        'Trademark & IP',
        'Commercial Disclosure',
        'Data Protection (DPDP)',
        'Territory & Exclusivity',
        'Master Franchise Agreement',
      ],
    },
    assignedCounselId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      required: true,
      enum: ['not_started', 'in_preparation', 'awaiting_counsel', 'changes_requested', 'counsel_review_recorded'],
      default: 'not_started',
    },
    checklist: [ChecklistItemSchema],
    documents: [LegalDocumentVersionSchema],
    counselReviewScope: { type: String },
    counselSignoffDate: { type: Date },
    counselNotes: { type: String },
  },
  { timestamps: true }
);

LegalMatterSchema.index({ brandId: 1, jurisdiction: 1 });
LegalMatterSchema.index({ assignedCounselId: 1 });
LegalMatterSchema.index({ status: 1 });

export const LegalMatter = mongoose.model<ILegalMatter>('LegalMatter', LegalMatterSchema);
