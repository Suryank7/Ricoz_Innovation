import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialAssumption {
  parameter: string;
  amount: number;
  currency: string;
  classification: 'historical_actual' | 'management_assumption' | 'projected_model';
  source: string;
  asOfDate: Date;
  notes?: string;
}

export interface IExpansionProposition extends Document {
  brandId: mongoose.Types.ObjectId;
  franchiseModel: 'Single-Unit Franchise' | 'Multi-Unit Development' | 'Area Development' | 'Master Franchise';
  targetGeography: {
    countries: string[];
    tier1Cities: string[];
    tier2Cities: string[];
    regions: string[];
  };
  minimumUnits: number;
  developmentPeriodMonths: number;
  fees: {
    franchiseFee: number;
    initialSetupEstimate: number;
    workingCapitalRequirement: number;
    royaltyPercentage: number;
    marketingFundPercentage: number;
    currency: string;
  };
  financialAssumptions: IFinancialAssumption[];
  investorFacingTeaser: {
    headline: string;
    summaryDescription: string;
    keyHighlights: string[];
    targetPaybackMonths: string;
    isApprovedByBrandOwner: boolean;
    approvedAt?: Date;
  };
  status: 'draft' | 'internal_review' | 'brand_approved' | 'active_for_matching';
  createdAt: Date;
  updatedAt: Date;
}

const FinancialAssumptionSchema = new Schema<IFinancialAssumption>(
  {
    parameter: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    classification: {
      type: String,
      required: true,
      enum: ['historical_actual', 'management_assumption', 'projected_model'],
    },
    source: { type: String, required: true },
    asOfDate: { type: Date, required: true },
    notes: { type: String },
  },
  { _id: false }
);

const ExpansionPropositionSchema = new Schema<IExpansionProposition>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    franchiseModel: {
      type: String,
      required: true,
      enum: ['Single-Unit Franchise', 'Multi-Unit Development', 'Area Development', 'Master Franchise'],
      default: 'Multi-Unit Development',
    },
    targetGeography: {
      countries: [{ type: String, default: 'India' }],
      tier1Cities: [{ type: String }],
      tier2Cities: [{ type: String }],
      regions: [{ type: String }],
    },
    minimumUnits: { type: Number, default: 1 },
    developmentPeriodMonths: { type: Number, default: 12 },
    fees: {
      franchiseFee: { type: Number, required: true, default: 1000000 },
      initialSetupEstimate: { type: Number, required: true, default: 3500000 },
      workingCapitalRequirement: { type: Number, required: true, default: 500000 },
      royaltyPercentage: { type: Number, required: true, default: 6 },
      marketingFundPercentage: { type: Number, required: true, default: 2 },
      currency: { type: String, default: 'INR' },
    },
    financialAssumptions: [FinancialAssumptionSchema],
    investorFacingTeaser: {
      headline: { type: String, required: true, default: 'High-growth category expansion opportunity' },
      summaryDescription: { type: String, required: true, default: 'Proven unit economics with repeatable operational playbook.' },
      keyHighlights: [{ type: String }],
      targetPaybackMonths: { type: String, default: '24-36 months' },
      isApprovedByBrandOwner: { type: Boolean, default: false },
      approvedAt: { type: Date },
    },
    status: {
      type: String,
      enum: ['draft', 'internal_review', 'brand_approved', 'active_for_matching'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const ExpansionProposition = mongoose.model<IExpansionProposition>(
  'ExpansionProposition',
  ExpansionPropositionSchema
);
