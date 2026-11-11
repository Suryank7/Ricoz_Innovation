import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchCriteriaBreakdown {
  sectorMatch: boolean;
  budgetMatch: boolean;
  geographyMatch: boolean;
  roleCapacityMatch: boolean;
  unmetCriteria: string[];
  missingInfo: string[];
}

export interface IMatch extends Document {
  brandId: mongoose.Types.ObjectId;
  expansionPropositionId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  adviserReviewStatus: 'pending_adviser' | 'adviser_approved' | 'adviser_rejected';
  rejectionReason?: string;
  matchScore: number;
  criteriaBreakdown: IMatchCriteriaBreakdown;
  adviserNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CriteriaBreakdownSchema = new Schema<IMatchCriteriaBreakdown>(
  {
    sectorMatch: { type: Boolean, default: false },
    budgetMatch: { type: Boolean, default: false },
    geographyMatch: { type: Boolean, default: false },
    roleCapacityMatch: { type: Boolean, default: false },
    unmetCriteria: [{ type: String }],
    missingInfo: [{ type: String }],
  },
  { _id: false }
);

const MatchSchema = new Schema<IMatch>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    expansionPropositionId: { type: Schema.Types.ObjectId, ref: 'ExpansionProposition', required: true },
    investorId: { type: Schema.Types.ObjectId, ref: 'Investor', required: true, index: true },
    adviserReviewStatus: {
      type: String,
      enum: ['pending_adviser', 'adviser_approved', 'adviser_rejected'],
      default: 'pending_adviser',
    },
    rejectionReason: { type: String },
    matchScore: { type: Number, required: true },
    criteriaBreakdown: CriteriaBreakdownSchema,
    adviserNotes: { type: String },
  },
  { timestamps: true }
);

MatchSchema.index({ brandId: 1, investorId: 1 }, { unique: true });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
