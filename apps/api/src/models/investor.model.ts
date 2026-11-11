import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestorActivity {
  type: 'note' | 'call' | 'email' | 'meeting' | 'review';
  summary: string;
  loggedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IInvestor extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  source: string;
  preferences: {
    targetSectors: string[];
    preferredLocations: string[];
    minBudget: number;
    maxBudget: number;
    currency: string;
    targetTimingMonths: number;
  };
  capability: {
    intendedRole: 'hands_on_operator' | 'multi_unit_operator' | 'area_developer' | 'master_franchisee' | 'passive_investor';
    maxUnitsCapacity: number;
    existingOperatingExperienceYears: number;
    sectorExperienceSummary: string;
  };
  qualification: {
    financialReviewStatus: 'unverified' | 'in_review' | 'verified_by_adviser' | 'rejected';
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    qualificationNotes?: string;
  };
  assignedAdviserId?: mongoose.Types.ObjectId;
  status: 'active' | 'evaluating' | 'engaged_in_deal' | 'withdrawn';
  activities: IInvestorActivity[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IInvestorActivity>(
  {
    type: { type: String, enum: ['note', 'call', 'email', 'meeting', 'review'], required: true },
    summary: { type: String, required: true },
    loggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InvestorSchema = new Schema<IInvestor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    source: {
      type: String,
      default: 'brokerage_network',
      enum: ['direct_referral', 'inbound_web', 'brokerage_network', 'event', 'consultant_network'],
    },
    preferences: {
      targetSectors: [{ type: String }],
      preferredLocations: [{ type: String }],
      minBudget: { type: Number, required: true, default: 2500000 },
      maxBudget: { type: Number, required: true, default: 10000000 },
      currency: { type: String, default: 'INR' },
      targetTimingMonths: { type: Number, default: 6 },
    },
    capability: {
      intendedRole: {
        type: String,
        required: true,
        enum: ['hands_on_operator', 'multi_unit_operator', 'area_developer', 'master_franchisee', 'passive_investor'],
        default: 'multi_unit_operator',
      },
      maxUnitsCapacity: { type: Number, default: 3 },
      existingOperatingExperienceYears: { type: Number, default: 5 },
      sectorExperienceSummary: { type: String, trim: true },
    },
    qualification: {
      financialReviewStatus: {
        type: String,
        enum: ['unverified', 'in_review', 'verified_by_adviser', 'rejected'],
        default: 'unverified',
      },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: { type: Date },
      qualificationNotes: { type: String },
    },
    assignedAdviserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['active', 'evaluating', 'engaged_in_deal', 'withdrawn'],
      default: 'active',
    },
    activities: [ActivitySchema],
  },
  { timestamps: true }
);

InvestorSchema.index({ status: 1 });
InvestorSchema.index({ 'qualification.financialReviewStatus': 1 });
InvestorSchema.index({ 'preferences.targetSectors': 1 });

export const Investor = mongoose.model<IInvestor>('Investor', InvestorSchema);
