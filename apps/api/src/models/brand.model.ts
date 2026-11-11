import mongoose, { Schema, Document } from 'mongoose';
import { BRAND_STATUSES, SECTORS } from '../config/constants';

export interface IBrand extends Document {
  name: string;
  legalEntity: string;
  sector: string;
  subSector?: string;
  operatingSince: Date;
  headquarters: {
    city: string;
    state: string;
    country: string;
  };
  contactPerson: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  assignedAdviserId?: mongoose.Types.ObjectId;
  status: string;
  readinessSummary: {
    operationsScore: number;
    economicsScore: number;
    brandIpScore: number;
    managementScore: number;
    legalScore: number;
    overallStatus: 'not_ready' | 'conditional' | 'franchise_ready';
  };
  confidentialitySettings: {
    blindedName: string;
    hideIdentityUntilConsent: boolean;
  };
  website?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    legalEntity: { type: String, required: true, trim: true },
    sector: { type: String, required: true, enum: SECTORS },
    subSector: { type: String, trim: true },
    operatingSince: { type: Date, required: true },
    headquarters: {
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, default: 'India', trim: true },
    },
    contactPerson: {
      name: { type: String, required: true, trim: true },
      title: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    assignedAdviserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      required: true,
      enum: BRAND_STATUSES,
      default: 'intake',
    },
    readinessSummary: {
      operationsScore: { type: Number, default: 0 },
      economicsScore: { type: Number, default: 0 },
      brandIpScore: { type: Number, default: 0 },
      managementScore: { type: Number, default: 0 },
      legalScore: { type: Number, default: 0 },
      overallStatus: {
        type: String,
        enum: ['not_ready', 'conditional', 'franchise_ready'],
        default: 'not_ready',
      },
    },
    confidentialitySettings: {
      blindedName: { type: String, default: 'Emerging Brand Opportunity' },
      hideIdentityUntilConsent: { type: Boolean, default: true },
    },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

BrandSchema.index({ status: 1 });
BrandSchema.index({ sector: 1 });
BrandSchema.index({ assignedAdviserId: 1 });

export const Brand = mongoose.model<IBrand>('Brand', BrandSchema);
